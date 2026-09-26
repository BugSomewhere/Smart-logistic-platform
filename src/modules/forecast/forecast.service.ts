import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { RunForecastDto } from './dto/run-forecast.dto.js';

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) { }

  async runForecast(dto: RunForecastDto) {
    // 1. Thu thập lịch sử xuất kho cho product
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        product_id: dto.product_id,
        type: 'out',
        ...(dto.warehouse_id && { warehouse_id: dto.warehouse_id })
      }, orderBy: { created_at: 'asc' }
    })

    // 2. Aggregate theo ngày
    const dailyMap = new Map<string, number>();
    for (const m of movements) {
      const dateKey = m.created_at.toISOString().split("T")[0]
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + m.quantity)
    }

    const history = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, quantity]) => ({ date, quantity }))

    if (history.length === 0) {
      throw new BadRequestException("No historical data for this product");
    }

    // 3. Gọi FastAPI /predict (với fallback sang Moving Average khi ML service lỗi)
    const mlUrl = this.config.get("ML_SERVICE_URL")
    let result: {
      model_used: string;
      predictions: Array<{ date: string; predicted_quantity: number; low_bound: number | null; upper_bound: number | null }>;
    };

    try {
      const response = await fetch(`${mlUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: dto.product_id,
          warehouse_id: dto.warehouse_id ?? null,
          history,
          periods: dto.periods ?? 30,
          model_type: dto.model_type ?? "prophet",
        }),
      });

      if (!response.ok) {
        throw new Error(`ML service returned status ${response.status}`);
      }

      result = await response.json();
    } catch (err: any) {
      this.logger.warn(`ML Service error: ${err.message}. Falling back to Simple Moving Average.`);

      const periods = dto.periods ?? 30;
      const totalQty = history.reduce((sum, h) => sum + h.quantity, 0);
      const avgQty = Math.max(1, Math.round(totalQty / (history.length || 1)));

      const predictions: Array<{ date: string; predicted_quantity: number; low_bound: number | null; upper_bound: number | null }> = [];
      const startDate = new Date();
      for (let i = 1; i <= periods; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i);
        predictions.push({
          date: nextDate.toISOString().split('T')[0],
          predicted_quantity: avgQty,
          low_bound: null,
          upper_bound: null,
        });
      }

      result = {
        model_used: 'moving_avg_fallback',
        predictions,
      };
    }

    if (!result.predictions || result.predictions.length === 0) {
      return {
        product_id: dto.product_id,
        model_used: result.model_used,
        predictions_count: 0,
        predictions: [],
      }
    }
    // 4. Lưu predictions vào bảng forecasts (Dùng transaction xoá cũ + tạo mới)
    const minForecastDate = new Date(result.predictions[0].date)

    const forecasts = await this.prisma.$transaction(async (tx) => {
      // Xoá các forecast tương lai cũ của sản phẩm này
      await tx.forecast.deleteMany({
        where: {
          product_id: dto.product_id,
          warehouse_id: dto.warehouse_id ?? null,
          forecast_date: { gte: minForecastDate },
        },
      });
      // Tạo các bản ghi dự báo mới
      return Promise.all(
        result.predictions.map((p: any) =>
          tx.forecast.create({
            data: {
              product_id: dto.product_id,
              warehouse_id: dto.warehouse_id ?? null,
              forecast_date: new Date(p.date),
              predicted_quantity: p.predicted_quantity,
              model_used: result.model_used,
            },
          }),
        ),
      );
    });
    return {
      product_id: dto.product_id,
      model_used: result.model_used,
      predictions_count: forecasts.length,
      predictions: result.predictions,
    };
  }

  async backfillActuals(productId: string, warehouseId?: string) {
    // 1. Lấy các forecast chưa có actual, đã qua ngày
    const pendingForecasts = await this.prisma.forecast.findMany({
      where: {
        product_id: productId,
        ...(warehouseId && { warehouse_id: warehouseId }),
        actual_quantity: null,
        forecast_date: { lt: new Date() }
      },
      orderBy: { forecast_date: 'asc' },
    });

    if (pendingForecasts.length === 0) return { updated: 0 }

    // 2. Lấy toàn bộ stock_movements (out) cho khoảng ngày cần
    const minDate = pendingForecasts[0].forecast_date
    const maxDate = pendingForecasts[pendingForecasts.length - 1].forecast_date

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        product_id: productId,
        type: 'out',
        ...(warehouseId && { warehouse_id: warehouseId }),
        created_at: { gte: minDate, lte: new Date(maxDate.getTime() + 86400000) }
      }
    })

    // 3. Aggregate theo ngày
    const dailyMap = new Map<string, number>();
    for (const m of movements) {
      const key = m.created_at.toISOString().split('T')[0]
      dailyMap.set(key, (dailyMap.get(key) || 0) + m.quantity)
    }

    // 4. Update từng forecast record
    let updated = 0
    await this.prisma.$transaction(
      pendingForecasts.map((f) => {
        const key = f.forecast_date.toISOString().split('T')[0]
        const actual = dailyMap.get(key) ?? 0
        updated++

        return this.prisma.forecast.update({
          where: { id: f.id },
          data: { actual_quantity: actual },
        })
      })
    )
    return { updated }
  }

  async getAccuracy(productId: string, warehouseId?: string) {
    const forecasts = await this.prisma.forecast.findMany({
      where: {
        product_id: productId,
        ...(warehouseId && { warehouse_id: warehouseId }),
        actual_quantity: { not: null }
      }
    })

    if (forecasts.length === 0) {
      return { count: 0, mae: null, rmse: null, mape: null }
    }

    let sumAE = 0
    let sumSE = 0;   // (predicted - actual)²
    let sumAPE = 0;  // |predicted - actual| / actual * 100
    let mapeCount = 0;

    for (const f of forecasts) {
      const predicted = Number(f.predicted_quantity)
      const actual = Number(f.actual_quantity)
      const error = predicted - actual

      sumAE += Math.abs(error)
      sumSE += error * error

      if (actual > 0) {
        sumAPE += (Math.abs(error) / actual) * 100
        mapeCount++
      }
    }

    const n = forecasts.length;
    return {
      count: n,
      mae: Math.round((sumAE / n) * 100) / 100,
      rmse: Math.round(Math.sqrt(sumSE / n) * 100) / 100,
      mape: mapeCount > 0
        ? Math.round((sumAPE / mapeCount) * 100) / 100
        : null,
    };
  }

  async getComparison(productId: string, warehouseId?: string) {
    const forecasts = await this.prisma.forecast.findMany({
      where: {
        product_id: productId,
        ...(warehouseId && { warehouse_id: warehouseId }),
        actual_quantity: { not: null }
      },
      orderBy: { forecast_date: 'asc' },
      select: {
        forecast_date: true,
        predicted_quantity: true,
        actual_quantity: true,
        model_used: true
      }
    })

    return forecasts.map((f) => ({
      date: f.forecast_date.toISOString().split('T')[0],
      predicted: Number(f.predicted_quantity),
      actual: Number(f.actual_quantity),
      model_used: f.model_used
    }))
  }

  async getRestockSuggestions(warehouseId: string, days: number = 30) {
    // 1. Lấy tất cả inventory của warehouse
    const inventories = await this.prisma.inventory.findMany({
      where: { warehouse_id: warehouseId },
      include: { product: true },
    });

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + days)

    const suggestions = []

    for (const inv of inventories) {
      // 2. Lấy forecasts cho sản phẩm này trong N ngày tới
      const forecasts = await this.prisma.forecast.findMany({
        where: {
          product_id: inv.product_id,
          warehouse_id: warehouseId,
          forecast_date: { gte: today, lte: endDate }
        }
      })

      const totalPredicted = forecasts.reduce((sum, f) => sum + Number(f.predicted_quantity), 0)
      // 3. Safety stock = low_stock_threshold
      const safetyStock = inv.low_stock_threshold
      const currentStock = inv.quantity

      const suggestedRestock = Math.max(0, Math.ceil(totalPredicted - currentStock + safetyStock))
      suggestions.push({
        product_id: inv.product_id,
        product_name: inv.product.name,
        product_sku: inv.product.sku,
        current_stock: currentStock,
        predicted_demand_next_days: Math.round(totalPredicted),
        safety_stock: safetyStock,
        suggested_restock: suggestedRestock,
        forecast_days: days,
        forecast_count: forecasts.length,
      });
    }
    // Sắp xếp theo urgency (suggested_restock giảm dần)
    return suggestions.sort((a, b) => b.suggested_restock - a.suggested_restock);
  }

  async findByProduct(productId: string) {
    return this.prisma.forecast.findMany({
      where: { product_id: productId },
      orderBy: { forecast_date: 'asc' }
    })
  }
}

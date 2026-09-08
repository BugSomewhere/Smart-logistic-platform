import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { RunForecastDto } from './dto/run-forecast.dto.js';

@Injectable()
export class ForecastService {
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
      throw new Error("No historical data for this product");
    }

    // 3. Gọi FastAPI /predict
    const mlUrl = this.config.get("ML_SERVICE_URL")
    const response = await fetch(`${mlUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: dto.product_id,
        warehouse_id: dto.warehouse_id ?? null,
        history,
        periods: dto.periods ?? 30,
      }),
    })

    if (!response.ok) {
      throw new InternalServerErrorException('ML service prediction failed');
    }

    const result = await response.json();
    // 4. Lưu predictions vào bảng forecasts
    const forecasts = await this.prisma.$transaction(
      result.predictions.map((p: any) =>
        this.prisma.forecast.create({
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
    return {
      product_id: dto.product_id,
      model_used: result.model_used,
      predictions_count: forecasts.length,
      predictions: result.predictions,
    };
  }

  async findByProduct(productId: string) {
    return this.prisma.forecast.findMany({
      where: { product_id: productId },
      orderBy: { forecast_date: 'asc' }
    })
  }
}

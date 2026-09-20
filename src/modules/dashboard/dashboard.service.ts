import { Injectable } from '@nestjs/common';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { ForecastService } from '#/modules/forecast/forecast.service.js';


@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly forecastService: ForecastService
  ) { }
  async getKpi() {
    const [
      totalOrders,
      deliveredOrders,
      totalInventory,
      activeRoutes,
      pendingOrders
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'delivered' } }),
      this.prisma.inventory.aggregate({ _sum: { quantity: true } }),
      this.prisma.route.count({ where: { status: 'in_progress' } }),
      this.prisma.order.count({ where: { status: 'pending' } }),
    ])

    return {
      total_orders: totalOrders,
      delivered_orders: deliveredOrders,
      delivery_success_rate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 10000)
        / 100 : 0,
      total_inventory: totalInventory._sum.quantity ?? 0,
      active_routes: activeRoutes,
      pending_orders: pendingOrders
    }
  }

  async getActiveDrivers() {
    const drivers = await this.prisma.driver.findMany({
      where: { status: 'on_route' },
      include: { user: { select: { full_name: true } } },
    });

    const result = [];
    for (const driver of drivers) {
      // Lấy location mới nhất
      const lastLocation = await this.prisma.driverLocation.findFirst({
        where: { driver_id: driver.id },
        orderBy: { recorded_at: 'desc' },
      });

      result.push({
        driver_id: driver.id,
        driver_name: driver.user.full_name,
        phone: driver.phone,
        latitude: lastLocation ? Number(lastLocation.latitude) : null,
        longitude: lastLocation ? Number(lastLocation.longitude) : null,
        last_updated: lastLocation?.recorded_at ?? null,
      });
    }

    return result;
  }

  async getForecastChart(productId: string) {
    return this.forecastService.getComparison(productId)
  }

  async getAlerts() {
    // 1. Tồn kho thấp
    const lowStock = await this.prisma.inventory.findMany({
      where: {
        quantity: { lte: this.prisma.inventory.fields.low_stock_threshold }
      },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
    });
    // Prisma không hỗ trợ compare 2 cột trực tiếp → dùng $queryRaw:
    const lowStockAlerts = await this.prisma.$queryRaw`
    SELECT i.product_id, p.name as product_name, p.sku,
           w.name as warehouse_name, i.quantity, i.low_stock_threshold
    FROM inventories i
    JOIN products p ON p.id = i.product_id
    JOIN warehouses w ON w.id = i.warehouse_id
    WHERE i.quantity <= i.low_stock_threshold
  `;

    return {
      low_stock: lowStockAlerts,
      generated_at: new Date().toISOString(),
    };
  }

}

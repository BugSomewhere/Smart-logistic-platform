import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OptimizeRouteDto } from './dto/optimize-route.dto.js';
import { AssignRouteDto } from './dto/assign-route.dto.js';
import { TspPoint, TspSolverService } from './tsp-solver.service.js';
import { DriverStatus, OrderStatus, RouteStatus } from '#/generated/prisma/enums.js';

@Injectable()
export class RouteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tspSolver: TspSolverService,
  ) { }

  async optimize(dto: OptimizeRouteDto) {
    // 1. Lấy confirmed orders cho ngày này
    const orders = await this.prisma.order.findMany({
      where: {
        planned_date: new Date(dto.route_date),
        status: OrderStatus.confirmed
      },
      include: {
        delivery_points: true,
        warehouse: true
      }
    })

    if (orders.length == 0) {
      throw new BadRequestException('No confirmed orders for this date');
    }
    // 2. Lấy depot (warehouse coords)
    const warehouse = orders[0].warehouse;
    const depot = {
      latitude: Number(warehouse.latitude),
      longitude: Number(warehouse.longitude)
    }

    // 3 Gom delivery points
    const points: TspPoint[] = orders.flatMap(order =>
      order.delivery_points.map(dp => ({
        id: dp.id,
        latitude: Number(dp.latitude),
        longitude: Number(dp.longitude)
      }))
    )
    // 4 Chạy thuật toán
    const result = this.tspSolver.solve(depot, points)

    // 5 Lưu Route + RouteStops
    const route = await this.prisma.route.create({
      data: {
        route_date: new Date(dto.route_date),
        total_distance_km: result.totalDistanceKm,
        status: 'planned',
        stops: {
          create: result.optimizedOrder.map(stop => ({
            delivery_point_id: stop.id,
            sequence: stop.sequence
          }))
        }
      },
      include: {
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' }
        }
      }
    });

    return this.formatRoute(route);
  }

  async findAll() {
    const routes = await this.prisma.route.findMany({
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' }
        }
      },
      orderBy: { route_date: 'desc' }
    });

    return routes.map(route => this.formatRoute(route));
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUniqueOrThrow({
      where: { id },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return this.formatRoute(route);
  }

  async assign(id: string, dto: AssignRouteDto) {
    const route = await this.prisma.route.findUnique({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID "${id}" not found`);
    }

    if (route.status !== RouteStatus.planned) {
      throw new BadRequestException(
        `Cannot assign driver and vehicle to route in "${route.status}" status`,
      );
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driver_id },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID "${dto.driver_id}" not found`);
    }

    if (driver.status !== DriverStatus.available) {
      throw new BadRequestException(
        `Driver is not available (current status: "${driver.status}")`,
      );
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicle_id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${dto.vehicle_id}" not found`);
    }

    const updatedRoute = await this.prisma.route.update({
      where: { id },
      data: {
        driver_id: dto.driver_id,
        vehicle_id: dto.vehicle_id,
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return this.formatRoute(updatedRoute);
  }

  // ponytail: format ETA for route stops to DD/MM/YYYY HH:mm
  private formatRoute<T extends { stops?: Array<any> }>(route: T) {
    if (!route || !route.stops) return route;
    return {
      ...route,
      stops: route.stops.map(stop => ({
        ...stop,
        formatted_eta: formatEta(stop.eta),
      })),
    };
  }
}

export function formatEta(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d).replace(',', '');
}


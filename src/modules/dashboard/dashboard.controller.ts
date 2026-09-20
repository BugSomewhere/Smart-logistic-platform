import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';


@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Roles(Role.ADMIN, Role.DISPATCHER, Role.WAREHOUSE_MANAGER)
  @Get('kpi')
  getKpi() { return this.dashboardService.getKpi(); }
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get('active-drivers')
  getActiveDrivers() { return this.dashboardService.getActiveDrivers(); }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get('forecast-chart')
  getForecastChart(@Query('product_id') productId: string) {
    return this.dashboardService.getForecastChart(productId);
  }
  
  @Roles(Role.ADMIN, Role.DISPATCHER, Role.WAREHOUSE_MANAGER)
  @Get('alerts')
  getAlerts() { return this.dashboardService.getAlerts(); }
}

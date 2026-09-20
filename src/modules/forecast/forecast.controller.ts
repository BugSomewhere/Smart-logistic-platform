import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ForecastService } from './forecast.service.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';
import { RunForecastDto } from './dto/run-forecast.dto.js';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) { }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Post('backfill-actual')
  backfillActuals(@Body() dto: RunForecastDto) {
    return this.forecastService.backfillActuals(dto.product_id, dto.warehouse_id)
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get('restock-suggestions/:warehouseId')
  getRestockSuggestions(
    @Param('warehouseId') warehouseId: string,
    @Query('days') days?: string,
  ) {
    return this.forecastService.getRestockSuggestions(
      warehouseId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Post('run')
  runForecast(@Body() dto: RunForecastDto) {
    return this.forecastService.runForecast(dto);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get(':productId/accuracy')
  getAccuracy(
    @Param('productId') productId: string,
    @Query('warehouse_id') warehouseId?: string,
  ) {
    return this.forecastService.getAccuracy(productId, warehouseId);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get(':productId/comparison')
  getComparison(
    @Param('productId') productId: string,
    @Query('warehouse_id') warehouseId?: string,
  ) {
    return this.forecastService.getComparison(productId, warehouseId);
  }



  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get(':productId')
  findByProduct(@Param('productId') productId: string) {
    return this.forecastService.findByProduct(productId);
  }



}

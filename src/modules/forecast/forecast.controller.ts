import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ForecastService } from './forecast.service.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';
import { RunForecastDto } from './dto/run-forecast.dto.js';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) { }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Post('run')
  runForecast(@Body() dto: RunForecastDto) {
    return this.forecastService.runForecast(dto);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get(':productId')
  findByProduct(@Param('productId') productId: string) {
    return this.forecastService.findByProduct(productId);
  }
}

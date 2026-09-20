import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';
import { ForecastModule } from '../forecast/forecast.module.js';

@Module({
  imports: [ForecastModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }

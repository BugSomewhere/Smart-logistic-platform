import { Module } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { RouteController } from './route.controller.js';
import { TspSolverService } from './tsp-solver.service.js';

@Module({
  controllers: [RouteController],
  providers: [RouteService, TspSolverService],
  exports: [RouteService],
})
export class RouteModule {}

import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { RouteService } from './route.service.js';
import { OptimizeRouteDto } from './dto/optimize-route.dto.js';
import { AssignRouteDto } from './dto/assign-route.dto.js';
import { Role } from "#/common/enums/role.enum.js"
import { Roles } from '#/common/decorators/roles.decorator.js';
import { ReorderStopsDto } from '../vehicle/dto/reorder-stops.dto.js';


@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) { }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Post('optimize')
  optimize(@Body() dto: OptimizeRouteDto) {
    return this.routeService.optimize(dto);
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignRouteDto) {
    return this.routeService.assign(id, dto);
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Patch(':id/reorder')
  reorderStops(@Param('id') id: string, @Body() dto: ReorderStopsDto) {
    return this.routeService.reorderStops(id, dto);
  }


  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get()
  findAll() {
    return this.routeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeService.findOne(id);
  }
}

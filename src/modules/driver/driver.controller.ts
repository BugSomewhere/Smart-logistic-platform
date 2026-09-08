import { Controller, Body, Post, Patch, Param, Get } from '@nestjs/common';
import { DriverService } from './driver.service.js';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) { }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDriverStatusDto) {
    return this.driverService.updateStatus(id, dto);
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get()
  findAll() {
    return this.driverService.findAll();
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driverService.findOne(id);
  }
}

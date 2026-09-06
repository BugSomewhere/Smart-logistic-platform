import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';
import { OrderStatus } from '#/generated/prisma/enums.js';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Roles(Role.ADMIN, Role.DISPATCHER, Role.WAREHOUSE_MANAGER)
  @Get()
  async findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: { status: OrderStatus }) {
    
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.DISPATCHER)
  @Post()
  async create(userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.create(userId, dto);
  }
}

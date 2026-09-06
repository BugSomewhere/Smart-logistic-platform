import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WarehouseService } from './warehouse.service.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { Public } from '#/common/decorators/public.decorator.js';
import { QueryStockHistoryDto } from './dto/query-stock-history.dto.js';


@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) { }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.create(createWarehouseDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.warehouseService.findAll();
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Post('stock-movement')
  createStockMovement(@Body() dto: CreateStockMovementDto){
    return this.warehouseService.createStockMovement(dto)
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get('stock-movement')
  getStockHistory(@Query() query: QueryStockHistoryDto){
    return this.warehouseService.getStockHistory(query)
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get('low-stock-alerts')
  getLowStockAlerts(){
    return this.warehouseService.getLowStockAlerts()
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, updateWarehouseDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Get(':id/stock')
  getStock(@Param('id') id: string){
    return this.warehouseService.getStock(id);
  }
}

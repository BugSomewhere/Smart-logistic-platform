import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import { PrismaService } from '#/modules/prisma/prisma.service.js';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: dto
    })
  }

  async findAll() {
    return this.prisma.warehouse.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }

  async findOne(id: string) {
    return this.prisma.warehouse.findUniqueOrThrow({
      where: {
        id: id
      }
    })
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return this.prisma.warehouse.update({
      where: {
        id: id
      },
      data: updateWarehouseDto
    })
  }

  async remove(id: string) {
    return this.prisma.warehouse.delete({
      where: {
        id: id
      }
    })
  }

  async getStock(warehouseId: string){
    return await this.prisma.inventory.findMany({
      where:{
        warehouse_id: warehouseId,
      },
      include:{
        product:true
      }
    })
  }
}

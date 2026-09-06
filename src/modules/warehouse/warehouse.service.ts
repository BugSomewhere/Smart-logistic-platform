import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { QueryStockHistoryDto } from './dto/query-stock-history.dto.js';

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

  async getStock(warehouseId: string) {
    return await this.prisma.inventory.findMany({
      where: {
        warehouse_id: warehouseId,
      },
      include: {
        product: true
      }
    })
  }

  async createStockMovement(dto: CreateStockMovementDto) {
    return this.prisma.$transaction(async (tx) => {

      const movement = await tx.stockMovement.create({ data: { ...dto } });

      const inventory = await tx.inventory.upsert({
        where: {
          product_id_warehouse_id: {
            product_id: dto.product_id,
            warehouse_id: dto.warehouse_id
          }
        },
        create: {
          product_id: dto.product_id,
          warehouse_id: dto.warehouse_id,
          quantity: dto.type === 'in' ? dto.quantity : -dto.quantity
        },
        update: {
          quantity: {
            increment: dto.type === 'in' ? dto.quantity : -dto.quantity
          }
        }
      })

      if (inventory.quantity < 0) {
        throw new BadRequestException('Insufficent stock')
      }
      return movement
    });
  }

  async getStockHistory(query: QueryStockHistoryDto) {
    const { product_id, warehouse_id, from, to } = query
    return this.prisma.stockMovement.findMany({
      where: {
        product_id,
        warehouse_id,
        created_at: {
          gte: from,
          lte: to
        }
      }, include: {
        product: true,
        warehouse: true
      }, orderBy: {
        created_at: 'desc'
      }
    })
  }
  async getLowStockAlerts() {
    const inventories = await this.prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    return inventories.filter(
      (inventory) =>
        inventory.quantity <= inventory.low_stock_threshold,
    );
  }
}

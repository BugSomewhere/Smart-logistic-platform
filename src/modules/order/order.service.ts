import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { OrderStatus } from '#/generated/prisma/enums.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { Order, OrderItem } from '#/generated/prisma/client.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: QueryOrderDto) {
    return this.prisma.order.findMany(
      {
        where: {
          status: query.status,
          planned_date: query.planned_date
        },
        include: {
          items: { include: { product: true } },
          delivery_points: true,
        },
      }
    )
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        delivery_points: true,
        creator: true,
      },
    })
  }

  async create(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lookup prices
      const productIds = dto.items.map(i => i.product_id);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found');
      }

      const priceMap = new Map(products.map(p => [p.id, p.price]));

      // 2. Calculate total
      const total_amount = dto.items.reduce((sum, item) => {
        const price = priceMap.get(item.product_id)!;
        return sum + Number(price) * item.quantity;
      }, 0);

      // 3. Create order with nested relations
      return tx.order.create({
        data: {
          warehouse_id: dto.warehouse_id,
          created_by: userId,
          total_amount: total_amount,
          planned_date: dto.planned_date ? new Date(dto.planned_date) : null,
          items: {
            create: dto.items.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: priceMap.get(item.product_id)!,
            })),
          },
          delivery_points: {
            create: dto.delivery_points,
          },
        },
        include: {
          items: { include: { product: true } },
          delivery_points: true,
        },
      });
    });
  }

  private readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipping', 'cancelled'],
    shipping: ['delivered', 'failed'],
    delivered: [],
    failed: [],
    cancelled: [],
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });
    // Validate state transition
    const allowed = this.validTransitions[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${order.status}" to "${dto.status}"`,
      );
    }
    // Xuất kho khi confirm
    if (dto.status === OrderStatus.confirmed) {
      return this.confirmOrder(order);
    }
    // Hoàn kho khi cancel đơn đã confirmed
    if (dto.status === OrderStatus.cancelled && order.status === OrderStatus.confirmed) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.stockMovement.create({
            data: {
              product_id: item.product_id,
              warehouse_id: order.warehouse_id,
              type: 'in',
              quantity: item.quantity,
              reference_order_id: order.id,
            },
          });
          await tx.inventory.update({
            where: {
              product_id_warehouse_id: {
                product_id: item.product_id,
                warehouse_id: order.warehouse_id,
              },
            },
            data: { quantity: { increment: item.quantity } },
          });
        }
        return tx.order.update({
          where: { id },
          data: { status: OrderStatus.cancelled },
        });
      });
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  private async confirmOrder(order: Order & { items: OrderItem[] }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check stock availability
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: {
            product_id_warehouse_id: {
              product_id: item.product_id,
              warehouse_id: order.warehouse_id,
            }
          }
        })

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${item.product_id}`)
        }
      }

      // 2. Deduct stock & create stock movements
      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            warehouse_id: order.warehouse_id,
            type: 'out',
            quantity: item.quantity,
            reference_order_id: order.id,
          }
        })

        await tx.inventory.update({
          where: {
            product_id_warehouse_id: {
              product_id: item.product_id,
              warehouse_id: order.warehouse_id,
            }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        })
      }

      // 3. Update status
      return tx.order.update({
        where: { id: order.id },
        data: { status: 'confirmed' },
        include: { items: true, delivery_points: true },
      });

    })


  }

}

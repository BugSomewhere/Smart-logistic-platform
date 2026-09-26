import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { QueryProductDto } from './dto/query-product-dto.js';
import { Prisma } from '#/generated/prisma/client.js';
import { UpdateProductDto } from './dto/update-product-dto.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async create(dto: CreateProductDto){
    const checkSku = await this.prisma.product.findFirst({
      where: {
        sku: dto.sku,
      }
    })

    if(checkSku){
      throw new BadRequestException('SKU already exists')
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        price: new Prisma.Decimal(dto.price)
      }
    })
  }

  async findAll(query: QueryProductDto) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(query.search && {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' }},
            { sku: { contains: query.search, mode: 'insensitive' } },
          ]
        }),
        ...(query.category_id && { category_id: query.category_id }),
      },
      include: { Category:true }
    })
  }

  async findOne(id: string){
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null }
    })
  }

  async update(id: string, dto: UpdateProductDto){
    const checkProduct = await this.prisma.product.findUnique({
      where: { id }
    })

    if(!checkProduct){
      throw new BadRequestException('Product not found')
    }

    return this.prisma.product.update({
      where: { id },
      data: dto
    })
  }

  async remove(id: string){
    const checkProduct = await this.prisma.product.findUnique({
      where: { id }
    })

    if(!checkProduct){
      throw new BadRequestException('Product not found')
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    })
  }
}

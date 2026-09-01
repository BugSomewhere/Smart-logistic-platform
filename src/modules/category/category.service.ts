import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return await this.prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }

  async create(dto: CreateCategoryDto){
    const isExisted = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
      }
    })
    if(isExisted){
      throw new ConflictException('Category already exists')
    }
    return await this.prisma.category.create({
      data: dto,
      select: {
        id: true,
        name: true,
        created_at: true
      }
    })
  }
//remove(id)	Check có product nào dùng không → nếu có throw → delete
  async remove(id: string){
    const productUsed = await this.prisma.product.findFirst({
      where: {
        category_id: id,
      }
    })
    if(productUsed){
      throw new ConflictException('Category is used by some products')
    }
    return await this.prisma.category.delete({
      where: {
        id: id
      }
    })
  }
}

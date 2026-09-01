import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product-dto.js';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';
import { QueryProductDto } from './dto/query-product-dto.js';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Post()
  create(@Body() dto: CreateProductDto){
    return this.productService.create(dto)
  }

  @Get()
  findAll(@Query() query: QueryProductDto){
    return this.productService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string){
    return this.productService.findOne(id)
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto){
    return this.productService.update(id, dto)
  }

  @Roles(Role.ADMIN, Role.WAREHOUSE_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string){
    return this.productService.remove(id)
  }
}

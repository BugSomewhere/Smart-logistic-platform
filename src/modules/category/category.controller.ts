import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { Roles } from '#/common/decorators/roles.decorator.js';
import { Role } from '#/common/enums/role.enum.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { CategoryService } from './category.service.js';
import { Public } from '#/common/decorators/public.decorator.js';
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCategoryDto){
    return this.categoryService.create(dto)
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string){
    return this.categoryService.remove(id)
  }

  @Public()
  @Get()
  findAll(){
    return this.categoryService.findAll()
  }
}

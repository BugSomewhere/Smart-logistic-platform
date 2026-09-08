import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { CreateDriverDto } from './dto/create-driver.dto.js';
import { UpdateDriverStatusDto } from './dto/update-driver-status.dto.js';

@Injectable()
export class DriverService {
   constructor(private readonly prisma: PrismaService) { }

   async create(dto: CreateDriverDto) {
      return this.prisma.driver.create({
         data: dto,
         include: { user: true }
      })
   }

   async updateStatus(id: string, dto: UpdateDriverStatusDto) {
      const driver = await this.prisma.driver.findUnique({
         where: { id }
      })
      if (!driver) {
         throw new NotFoundException(`Driver with ID "${id}" not found`)
      }
      return this.prisma.driver.update({
         where: { id },
         data: dto,
         include: { user: true }
      })
   }

   async findAll() {
      return this.prisma.driver.findMany({
         include: { user: true }
      })
   }

   async findOne(id: string) {
      return this.prisma.driver.findUnique({
         where: { id },
         include: { user: true }
      })
   }


}

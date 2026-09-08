import { Injectable } from '@nestjs/common';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: dto });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async findOne(id: string) {
    return this.prisma.route.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.route.findMany({
      include: {
        driver: true,
        vehicle: true,
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  
}

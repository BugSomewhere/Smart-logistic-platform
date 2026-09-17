import { Injectable } from '@nestjs/common';
import { CreateTrackingDto } from './dto/create-tracking.dto.js';
import { UpdateTrackingDto } from './dto/update-tracking.dto.js';

@Injectable()
export class TrackingService {
  create(createTrackingDto: CreateTrackingDto) {
    return 'This action adds a new tracking';
  }

  findAll() {
    return `This action returns all tracking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tracking`;
  }

  update(id: number, updateTrackingDto: UpdateTrackingDto) {
    return `This action updates a #${id} tracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} tracking`;
  }
}

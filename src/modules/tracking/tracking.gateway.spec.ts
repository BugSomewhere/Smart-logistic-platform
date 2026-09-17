import { Test, TestingModule } from '@nestjs/testing';
import { TrackingGateway } from './tracking.gateway.js';
import { TrackingService } from './tracking.service.js';

describe('TrackingGateway', () => {
  let gateway: TrackingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingGateway, TrackingService],
    }).compile();

    gateway = module.get<TrackingGateway>(TrackingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

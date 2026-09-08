import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatEta, RouteService } from './route.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DriverStatus, RouteStatus } from '#/generated/prisma/enums.js';

describe('RouteStop ETA formatting', () => {
  it('formats valid Date to DD/MM/YYYY HH:mm in UTC+7 (Asia/Ho_Chi_Minh)', () => {
    // 2026-09-08T07:30:00.000Z corresponds to 14:30 in Asia/Ho_Chi_Minh
    const date = new Date('2026-09-08T07:30:00.000Z');
    expect(formatEta(date)).toBe('08/09/2026 14:30');
  });

  it('formats ISO date string properly', () => {
    expect(formatEta('2026-09-08T07:30:00.000Z')).toBe('08/09/2026 14:30');
  });

  it('returns null when eta is null or undefined', () => {
    expect(formatEta(null)).toBeNull();
    expect(formatEta(undefined)).toBeNull();
  });

  it('returns null when eta is an invalid date string', () => {
    expect(formatEta('invalid-date')).toBeNull();
  });
});

describe('RouteService.assign', () => {
  let service: RouteService;
  let prismaMock: any;
  let tspMock: any;

  beforeEach(() => {
    prismaMock = {
      route: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      driver: {
        findUnique: vi.fn(),
      },
      vehicle: {
        findUnique: vi.fn(),
      },
    };
    tspMock = {};
    service = new RouteService(prismaMock, tspMock);
  });

  const dto = {
    driver_id: 'driver-uuid-1',
    vehicle_id: 'vehicle-uuid-1',
  };

  it('throws NotFoundException if route is not found', async () => {
    prismaMock.route.findUnique.mockResolvedValue(null);

    await expect(service.assign('non-existent-id', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException if route is not in planned status', async () => {
    prismaMock.route.findUnique.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.in_progress,
    });

    await expect(service.assign('route-1', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws NotFoundException if driver is not found', async () => {
    prismaMock.route.findUnique.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.planned,
    });
    prismaMock.driver.findUnique.mockResolvedValue(null);

    await expect(service.assign('route-1', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException if driver is not available', async () => {
    prismaMock.route.findUnique.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.planned,
    });
    prismaMock.driver.findUnique.mockResolvedValue({
      id: 'driver-uuid-1',
      status: DriverStatus.on_route,
    });

    await expect(service.assign('route-1', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws NotFoundException if vehicle is not found', async () => {
    prismaMock.route.findUnique.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.planned,
    });
    prismaMock.driver.findUnique.mockResolvedValue({
      id: 'driver-uuid-1',
      status: DriverStatus.available,
    });
    prismaMock.vehicle.findUnique.mockResolvedValue(null);

    await expect(service.assign('route-1', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('successfully assigns driver and vehicle to route', async () => {
    prismaMock.route.findUnique.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.planned,
    });
    prismaMock.driver.findUnique.mockResolvedValue({
      id: 'driver-uuid-1',
      status: DriverStatus.available,
    });
    prismaMock.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle-uuid-1',
      plate_number: '59A-12345',
    });
    prismaMock.route.update.mockResolvedValue({
      id: 'route-1',
      status: RouteStatus.planned,
      driver_id: 'driver-uuid-1',
      vehicle_id: 'vehicle-uuid-1',
      driver: { id: 'driver-uuid-1', phone: '0901234567' },
      vehicle: { id: 'vehicle-uuid-1', plate_number: '59A-12345' },
      stops: [],
    });

    const result = await service.assign('route-1', dto);

    expect(result.driver_id).toBe('driver-uuid-1');
    expect(result.vehicle_id).toBe('vehicle-uuid-1');
    expect(prismaMock.route.update).toHaveBeenCalledWith({
      where: { id: 'route-1' },
      data: {
        driver_id: 'driver-uuid-1',
        vehicle_id: 'vehicle-uuid-1',
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: {
          include: { delivery_point: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  });
});

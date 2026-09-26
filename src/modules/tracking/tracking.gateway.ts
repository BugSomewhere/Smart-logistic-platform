import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/tracking', cors: { origin: '*' } })
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  // In-memory: driver_id → latest position (cho dashboard subscribe nhanh)
  private driverPositions = new Map<
    string,
    { latitude: number; longitude: number; updatedAt: Date }
  >();

  constructor(private readonly prisma: PrismaService) { }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ─── Tài xế emit vị trí ───────────────────────────
  @SubscribeMessage('driver:location')
  async handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      driver_id: string;
      route_id?: string;
      latitude: number;
      longitude: number;
    },
  ) {
    // 1. Lưu vào DB (lịch sử hành trình — FR-TRK-04)
    await this.prisma.driverLocation.create({
      data: {
        driver_id: data.driver_id,
        route_id: data.route_id ?? null,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    // Cập nhật trạng thái driver sang on_route
    await this.prisma.driver.updateMany({
      where: { id: data.driver_id, status: 'available' },
      data: { status: 'on_route' },
    });

    // 2. Cập nhật in-memory
    this.driverPositions.set(data.driver_id, {
      latitude: data.latitude,
      longitude: data.longitude,
      updatedAt: new Date(),
    });

    // 3. Broadcast cho dashboard subscribers
    this.server.emit('driver:position-updated', {
      driver_id: data.driver_id,
      latitude: data.latitude,
      longitude: data.longitude,
      route_id: data.route_id,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Tài xế cập nhật trạng thái điểm giao ────────
  @SubscribeMessage('delivery:status-update')
  async handleDeliveryStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      route_stop_id: string;
      status: 'arrived' | 'completed' | 'failed';
      note?: string;
    },
  ) {
    const stop = await this.prisma.routeStop.update({
      where: { id: data.route_stop_id },
      data: { status: data.status },
      include: { delivery_point: true },
    });

    // Broadcast cho dashboard
    this.server.emit('delivery:status-changed', {
      route_stop_id: data.route_stop_id,
      status: data.status,
      note: data.note,
      delivery_point: stop.delivery_point,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Dashboard request: lấy tất cả vị trí hiện tại ──
  @SubscribeMessage('dashboard:get-all-positions')
  handleGetAllPositions() {
    const positions = Array.from(this.driverPositions.entries()).map(
      ([driver_id, pos]) => ({
        driver_id,
        ...pos,
      }),
    );
    return { event: 'dashboard:all-positions', data: positions };
  }
}

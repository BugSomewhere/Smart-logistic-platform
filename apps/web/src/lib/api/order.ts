import { api } from './client';
import {
  CreateOrderDto,
  Order,
  OrderStatus,
  UpdateOrderStatusDto,
} from './types';

export interface QueryOrderParams {
  status?: OrderStatus;
  planned_date?: string;
}

export const orderApi = {
  async getOrders(params?: QueryOrderParams): Promise<Order[]> {
    return api.get<Order[]>('/order', { params });
  },

  async getOrderById(id: string): Promise<Order> {
    return api.get<Order>(`/order/${id}`);
  },

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    return api.post<Order>('/order', dto);
  },

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return api.patch<Order>(`/order/${id}/status`, dto);
  },
};

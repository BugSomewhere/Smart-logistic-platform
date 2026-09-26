import { api } from './client';
import {
  CreateStockMovementDto,
  CreateWarehouseDto,
  Inventory,
  LowStockAlert,
  StockMovement,
  Warehouse,
} from './types';

export interface QueryStockHistoryParams {
  product_id?: string;
  warehouse_id?: string;
}

export const warehouseApi = {
  async getWarehouses(): Promise<Warehouse[]> {
    return api.get<Warehouse[]>('/warehouse');
  },

  async getWarehouseById(id: string): Promise<Warehouse> {
    return api.get<Warehouse>(`/warehouse/${id}`);
  },

  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    return api.post<Warehouse>('/warehouse', dto);
  },

  async updateWarehouse(
    id: string,
    dto: Partial<CreateWarehouseDto>,
  ): Promise<Warehouse> {
    return api.patch<Warehouse>(`/warehouse/${id}`, dto);
  },

  async deleteWarehouse(id: string): Promise<void> {
    return api.delete(`/warehouse/${id}`);
  },

  async getStock(warehouseId: string): Promise<Inventory[]> {
    return api.get<Inventory[]>(`/warehouse/${warehouseId}/stock`);
  },

  async createStockMovement(
    dto: CreateStockMovementDto,
  ): Promise<StockMovement> {
    return api.post<StockMovement>('/warehouse/stock-movement', dto);
  },

  async getStockHistory(
    params?: QueryStockHistoryParams,
  ): Promise<StockMovement[]> {
    return api.get<StockMovement[]>('/warehouse/stock-movement', { params });
  },

  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    return api.get<LowStockAlert[]>('/warehouse/low-stock-alerts');
  },
};

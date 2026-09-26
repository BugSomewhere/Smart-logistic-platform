import { api } from './client';
import {
  ForecastComparisonResponse,
  ForecastRecord,
  RunForecastDto,
  RunForecastResponse,
} from './types';

export interface RestockSuggestion {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  low_stock_threshold: number;
  predicted_demand: number;
  suggested_restock: number;
}

export const forecastApi = {
  async runForecast(dto: RunForecastDto): Promise<RunForecastResponse> {
    return api.post<RunForecastResponse>('/forecast/run', dto);
  },

  async getForecastByProduct(productId: string): Promise<ForecastRecord[]> {
    return api.get<ForecastRecord[]>(`/forecast/${productId}`);
  },

  async getComparison(
    productId: string,
    warehouseId?: string,
  ): Promise<ForecastComparisonResponse> {
    return api.get<ForecastComparisonResponse>(
      `/forecast/${productId}/comparison`,
      { params: { warehouse_id: warehouseId } },
    );
  },

  async getAccuracy(
    productId: string,
    warehouseId?: string,
  ): Promise<{ mae: number | null; rmse: number | null; mape: number | null }> {
    return api.get(`/forecast/${productId}/accuracy`, {
      params: { warehouse_id: warehouseId },
    });
  },

  async getRestockSuggestions(
    warehouseId: string,
    days: number = 30,
  ): Promise<RestockSuggestion[]> {
    return api.get<RestockSuggestion[]>(
      `/forecast/restock-suggestions/${warehouseId}`,
      { params: { days } },
    );
  },

  async backfillActuals(
    dto: RunForecastDto,
  ): Promise<{ updated: number }> {
    return api.post<{ updated: number }>('/forecast/backfill-actual', dto);
  },
};

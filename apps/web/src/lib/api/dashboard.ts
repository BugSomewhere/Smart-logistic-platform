import { api } from './client';
import {
  DashboardAlertsResponse,
  Driver,
  ForecastComparisonResponse,
} from './types';

export interface DashboardKpiData {
  total_orders_today: number;
  confirmed_orders: number;
  shipping_orders: number;
  delivered_orders: number;
  active_routes: number;
  low_stock_count: number;
  active_drivers_count: number;
}

export const dashboardApi = {
  async getKpi(): Promise<DashboardKpiData> {
    return api.get<DashboardKpiData>('/dashboard/kpi');
  },

  async getActiveDrivers(): Promise<Driver[]> {
    return api.get<Driver[]>('/dashboard/active-drivers');
  },

  async getForecastChart(
    productId: string,
  ): Promise<ForecastComparisonResponse> {
    return api.get<ForecastComparisonResponse>('/dashboard/forecast-chart', {
      params: { product_id: productId },
    });
  },

  async getAlerts(): Promise<DashboardAlertsResponse> {
    return api.get<DashboardAlertsResponse>('/dashboard/alerts');
  },
};

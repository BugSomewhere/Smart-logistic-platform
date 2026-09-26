import { api } from './client';
import {
  AssignRouteDto,
  Driver,
  DriverStatus,
  OptimizeRouteDto,
  ReorderStopsDto,
  Route,
  Vehicle,
} from './types';

export const routeApi = {
  async getRoutes(): Promise<Route[]> {
    return api.get<Route[]>('/route');
  },

  async getRouteById(id: string): Promise<Route> {
    return api.get<Route>(`/route/${id}`);
  },

  async optimizeRoute(dto: OptimizeRouteDto): Promise<Route> {
    return api.post<Route>('/route/optimize', dto);
  },

  async assignRoute(id: string, dto: AssignRouteDto): Promise<Route> {
    return api.patch<Route>(`/route/${id}/assign`, dto);
  },

  async reorderStops(id: string, dto: ReorderStopsDto): Promise<Route> {
    return api.patch<Route>(`/route/${id}/reorder`, dto);
  },

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return api.get<Driver[]>('/driver');
  },

  async getDriverById(id: string): Promise<Driver> {
    return api.get<Driver>(`/driver/${id}`);
  },

  async updateDriverStatus(
    id: string,
    status: DriverStatus,
  ): Promise<Driver> {
    return api.patch<Driver>(`/driver/${id}/status`, { status });
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return api.get<Vehicle[]>('/vehicle');
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    return api.get<Vehicle>(`/vehicle/${id}`);
  },
};

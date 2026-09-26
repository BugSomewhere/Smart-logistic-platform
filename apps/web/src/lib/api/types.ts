// ============================================================================
// Enums matching Prisma / NestJS core schema
// ============================================================================

export enum Role {
  ADMIN = 'admin',
  WAREHOUSE_MANAGER = 'warehouse_manager',
  DISPATCHER = 'dispatcher',
  DRIVER = 'driver',
}

export enum MovementType {
  IN = 'in',
  OUT = 'out',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_ROUTE = 'on_route',
  OFF_DUTY = 'off_duty',
}

export enum RouteStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum RouteStopStatus {
  PENDING = 'pending',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// ============================================================================
// Core Entities
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface UserProfile extends User {
  driver?: Driver | null;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  unit: string;
  price: number | string;
  created_at: string;
  deletedAt?: string | null;
  Category?: Category;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  low_stock_threshold: number;
  product?: Product;
  warehouse?: Warehouse;
}

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  type: MovementType;
  quantity: number;
  reference_order_id?: string | null;
  created_at: string;
  product?: Product;
  warehouse?: Warehouse;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number | string;
  product?: Product;
}

export interface DeliveryPoint {
  id: string;
  order_id: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  time_window_start?: string | null;
  time_window_end?: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number | string;
  warehouse_id: string;
  created_by: string;
  planned_date?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  delivery_points: DeliveryPoint[];
  warehouse?: Warehouse;
  creator?: User;
}

export interface Driver {
  id: string;
  user_id: string;
  phone: string;
  status: DriverStatus;
  user?: User;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  capacity: number | string;
  type: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  delivery_point_id: string;
  sequence: number;
  eta?: string | null;
  formatted_eta?: string | null;
  status: RouteStopStatus;
  delivery_point?: DeliveryPoint;
}

export interface Route {
  id: string;
  route_date: string;
  driver_id?: string | null;
  vehicle_id?: string | null;
  status: RouteStatus;
  total_distance_km?: number | null;
  total_duration_min?: number | null;
  created_at: string;
  driver?: Driver | null;
  vehicle?: Vehicle | null;
  stops: RouteStop[];
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  route_id?: string | null;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface ForecastRecord {
  id: string;
  product_id: string;
  warehouse_id?: string | null;
  forecast_date: string;
  predicted_quantity: number;
  actual_quantity?: number | null;
  model_used: string;
  accuracy_mape?: number | null;
  created_at: string;
}

// ============================================================================
// DTOs & Request / Response Payloads
// ============================================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  full_name: string;
  role?: Role;
  phone?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface AuthResponse extends AuthTokens {
  user?: User;
}

export interface QueryProductDto {
  search?: string;
  category_id?: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  category_id: string;
  unit: string;
  price: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateWarehouseDto {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CreateStockMovementDto {
  product_id: string;
  warehouse_id: string;
  type: MovementType;
  quantity: number;
  reference_order_id?: string;
}

export interface CreateOrderItemDto {
  product_id: string;
  quantity: number;
}

export interface CreateDeliveryPointDto {
  address: string;
  latitude: number;
  longitude: number;
  time_window_start?: string;
  time_window_end?: string;
}

export interface CreateOrderDto {
  warehouse_id: string;
  items: CreateOrderItemDto[];
  delivery_points: CreateDeliveryPointDto[];
  planned_date?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface OptimizeRouteDto {
  route_date: string;
  warehouse_id: string;
}

export interface AssignRouteDto {
  driver_id: string;
  vehicle_id: string;
}

export interface ReorderStopsDto {
  stop_ids: string[];
}

export interface RunForecastDto {
  product_id: string;
  warehouse_id?: string;
  periods?: number;
  model_type?: 'prophet' | 'sarimax' | 'auto';
}

export interface ForecastPredictionItem {
  date: string;
  predicted_quantity: number;
  low_bound: number | null;
  upper_bound: number | null;
}

export interface RunForecastResponse {
  product_id: string;
  model_used: string;
  predictions_count: number;
  predictions: ForecastPredictionItem[];
}

export interface ForecastComparisonItem {
  date: string;
  predicted: number;
  actual: number | null;
  error?: number | null;
}

export interface ForecastComparisonResponse {
  product_id: string;
  metrics: {
    mae?: number | null;
    rmse?: number | null;
    mape?: number | null;
  };
  comparison: ForecastComparisonItem[];
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_name: string;
  quantity: number;
  low_stock_threshold: number;
}

export interface DashboardAlertsResponse {
  low_stock: LowStockAlert[];
  generated_at: string;
}

export interface DashboardKpisResponse {
  total_orders_today: number;
  orders_by_status: Record<OrderStatus, number>;
  active_routes: number;
  active_drivers: number;
  low_stock_alerts_count: number;
}

// WebSocket Event Payloads (/tracking)
export interface DriverLocationEmitPayload {
  driver_id: string;
  route_id?: string | null;
  latitude: number;
  longitude: number;
}

export interface DeliveryStatusUpdateEmitPayload {
  route_stop_id: string;
  status: 'arrived' | 'completed' | 'failed';
  note?: string;
}

export interface DriverPositionUpdateEvent {
  driver_id: string;
  latitude: number;
  longitude: number;
  route_id?: string;
  timestamp: string;
}

export interface DeliveryStatusChangedEvent {
  route_stop_id: string;
  status: 'arrived' | 'completed' | 'failed';
  note?: string;
  delivery_point?: DeliveryPoint;
  timestamp: string;
}

# Smart Logistics Platform — Project Context & Architecture Documentation

> **Tài liệu tham chiếu toàn diện về kiến trúc, luồng dữ liệu, nghiệp vụ, danh sách lỗi và giải pháp khắc phục cho hệ thống Smart Logistics Platform.**

---

## 1. Project Architecture (Kiến trúc tổng thể)

Hệ thống được thiết kế theo mô hình **Hybrid Microservice & Event-Driven Architecture**:
1. **Core Service (NestJS 12)**:
   - Đóng vai trò backend điều phối chính, cung cấp RESTful APIs và WebSocket Gateway.
   - Sử dụng Node.js ES Modules (`"type": "module"`), alias `#/*` trỏ tới `./dist/*` (runtime) và `./src/*` (tsconfig).
   - Tầng dữ liệu sử dụng **Prisma ORM 7** kết hợp driver `@prisma/adapter-pg` kết nối cơ sở dữ liệu **PostgreSQL**.
   - Phân hệ quan sát (telemetry/distributed tracing) tích hợp qua `@nestjs/observe` ([`AppModule`](file:///c:/vsCode/smart-logistics/src/app.module.ts)).
   - Xác thực & phân quyền bằng JWT kép (Access + Refresh Token) cùng hệ thống Guard toàn cục (`APP_GUARD`).
2. **Machine Learning Service (Python FastAPI)**:
   - Dịch vụ dự báo nhu cầu độc lập tại thư mục [`services/ml-service`](file:///c:/vsCode/smart-logistics/services/ml-service).
   - Chạy thuật toán dự báo chuỗi thời gian: **Facebook Prophet** hoặc **SARIMAX (statsmodels)** với fallback là **Moving Average**.
   - NestJS gọi sang FastAPI qua giao thức HTTP REST tại endpoint `POST ${ML_SERVICE_URL}/api/predict`.
3. **Real-time Tracking (Socket.IO)**:
   - Gateway WebSocket tại namespace `/tracking` ([`TrackingGateway`](file:///c:/vsCode/smart-logistics/src/modules/tracking/tracking.gateway.ts)).
   - Tiếp nhận tọa độ GPS từ tài xế theo chu kỳ thời gian thực, lưu trữ lịch sử vào DB và broadcast cho Dashboard quản trị.

---

## 2. Module Relationships (Mối quan hệ giữa các Module)

```
                       ┌──────────────────────┐
                       │      AppModule       │
                       └──────────┬───────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │ PrismaModule │ (Global)│  AuthModule  │         │  UserModule  │
  └──────────────┘         └──────────────┘         └──────────────┘
         │
         ├────────────────────────┬────────────────────────┐
         ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │CategoryModule│         │ProductModule │         │WarehouseMod. │
  └──────────────┘         └──────────────┘         └──────┬───────┘
                                                           │
         ┌────────────────────────┬────────────────────────┤
         ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │ OrderModule  │         │ RouteModule  │         │ForecastModule│
  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
         │                        │                        │
         │ (orders -> routes)     │ (stops -> status)      │ (demand)
         ▼                        ▼                        │
  ┌──────────────┐         ┌──────────────┐                │
  │Driver/Vehicle│◄────────┤TrackingModule│                │
  └──────────────┘         └──────────────┘                │
                                  ▲                        │
                                  │                        ▼
                           ┌──────┴────────────────────────────────┐
                           │            DashboardModule            │
                           └───────────────────────────────────────┘
```

### Chi tiết phụ thuộc liên module:
- **[`PrismaModule`](file:///c:/vsCode/smart-logistics/src/modules/prisma/prisma.module.ts)**: Module toàn cục (`@Global()`), cung cấp `PrismaService` cho tất cả các service khác truy vấn DB.
- **[`AuthModule`](file:///c:/vsCode/smart-logistics/src/modules/auth/auth.module.ts)**: Cung cấp `AccessTokenGuard`, `RefreshTokenGuard`, `RolesGuard` cho toàn bộ ứng dụng thông qua `APP_GUARD` tại `AppModule`.
- **[`OrderModule`](file:///c:/vsCode/smart-logistics/src/modules/order/order.module.ts)**:
  - Khi xác nhận đơn hàng (`confirmOrder`), trực tiếp trừ tồn kho tại bảng `inventories` và sinh bản ghi tại `stock_movements`.
  - Cung cấp các đơn hàng trạng thái `confirmed` có cùng `planned_date` làm đầu vào cho `RouteModule`.
- **[`RouteModule`](file:///c:/vsCode/smart-logistics/src/modules/route/route.module.ts)**:
  - Lấy danh sách điểm giao `delivery_points` từ các đơn hàng đã xác nhận, gom cụm theo kho hàng (depot) để tối ưu hóa tuyến đường qua `TspSolverService`.
  - Gán tài xế (`Driver`) và phương tiện (`Vehicle`) cho lộ trình (`Route`).
- **[`ForecastModule`](file:///c:/vsCode/smart-logistics/src/modules/forecast/forecast.module.ts)**:
  - Xuất `ForecastService` để `DashboardModule` gọi lấy dữ liệu đối chiếu dự báo vs thực tế (`getComparison`).
  - Đọc lịch sử xuất kho `stock_movements` (type `'out'`) theo từng `product_id` làm input dữ liệu cho ML Service.
- **[`TrackingModule`](file:///c:/vsCode/smart-logistics/src/modules/tracking/tracking.module.ts)**:
  - Nhận vị trí GPS tài xế, lưu vào bảng `driver_locations`.
  - Cập nhật trạng thái các điểm dừng `route_stops` và phát tín hiệu cho Dashboard.
- **[`DashboardModule`](file:///c:/vsCode/smart-logistics/src/modules/dashboard/dashboard.module.ts)**:
  - Import `ForecastModule` để dựng biểu đồ dự báo.
  - Tổng hợp số liệu KPI từ `orders`, `inventories`, `routes`, `driver_locations`.

---

## 3. Database & Prisma Structure (Cơ sở dữ liệu)

Sơ đồ quan hệ thực thể (ERD) được định nghĩa tại [`prisma/schema.prisma`](file:///c:/vsCode/smart-logistics/prisma/schema.prisma):

### 3.1. Các Enum hệ thống:
- **`Role`**: `admin`, `warehouse_manager`, `dispatcher`, `driver`.
- **`MovementType`**: `in` (nhập kho), `out` (xuất kho).
- **`OrderStatus`**: `pending` $\rightarrow$ `confirmed` $\rightarrow$ `shipping` $\rightarrow$ `delivered` / `failed` (hoặc `cancelled`).
- **`DriverStatus`**: `available`, `on_route`, `off_duty`.
- **`RouteStatus`**: `planned`, `in_progress`, `completed`.
- **`RouteStopStatus`**: `pending`, `arrived`, `completed`, `failed`.

### 3.2. Chi tiết 14 Bảng dữ liệu:
| Bảng | Khóa chính | Trường quan trọng | Ràng buộc & Quan hệ |
| :--- | :--- | :--- | :--- |
| **`users`** | `id (UUID)` | `email`, `password_hash`, `role`, `refresh_token` | 1-1 với `Driver`, 1-N với `Order` (creator) |
| **`categories`** | `id (UUID)` | `name (unique)` | 1-N với `Product` |
| **`products`** | `id (UUID)` | `sku (unique)`, `name`, `price`, `deletedAt` | N-1 với `Category`, 1-N với `Inventory`, `StockMovement`, `Forecast` |
| **`warehouses`** | `id (UUID)` | `name`, `address`, `latitude`, `longitude` | 1-N với `Inventory`, `Order`, `StockMovement`, `Forecast` |
| **`inventories`** | `id (UUID)` | `quantity`, `low_stock_threshold` | Unique composite `[product_id, warehouse_id]` |
| **`stock_movements`** | `id (UUID)` | `type (in/out)`, `quantity`, `reference_order_id` | N-1 với `Product`, `Warehouse`, `Order` |
| **`orders`** | `id (UUID)` | `status`, `total_amount`, `planned_date` | N-1 với `Warehouse`, `User`; 1-N với `OrderItem`, `DeliveryPoint` |
| **`order_items`** | `id (UUID)` | `quantity`, `unit_price` | Cascade delete theo `Order`, N-1 với `Product` |
| **`delivery_points`** | `id (UUID)` | `address`, `latitude`, `longitude`, `time_window_start/end` | Cascade delete theo `Order`, 1-N với `RouteStop` |
| **`drivers`** | `id (UUID)` | `phone`, `status` | 1-1 với `User`, 1-N với `Route`, 1-N với `DriverLocation` |
| **`vehicles`** | `id (UUID)` | `plate_number (unique)`, `capacity`, `type` | 1-N với `Route` |
| **`routes`** | `id (UUID)` | `route_date`, `status`, `total_distance_km` | N-1 với `Driver`, `Vehicle`; 1-N với `RouteStop`, `DriverLocation` |
| **`route_stops`** | `id (UUID)` | `sequence`, `eta`, `status` | Cascade delete theo `Route`, N-1 với `DeliveryPoint` |
| **`driver_locations`** | `id (UUID)`| `latitude`, `longitude`, `recorded_at` | N-1 với `Driver`, N-1 với `Route` (nullable) |
| **`forecasts`** | `id (UUID)` | `forecast_date`, `predicted_quantity`, `actual_quantity`, `model_used` | N-1 với `Product`, N-1 với `Warehouse` (nullable) |

---

## 4. Authentication & Authorization Flow (Luồng xác thực)

```
[Client] ──1. POST /auth/login (email, password)──► [AuthController]
                                                           │
                                                           ▼
                                                    [AuthService]
                                                    - bcrypt.compare()
                                                    - Sign AccessToken (JWT)
                                                    - Sign RefreshToken (JWT)
                                                    - Hash & lưu RefreshToken vào User
                                                           │
[Client] ◄──2. Trả về { access_token, refresh_token }──────┘
   │
   ├──3. Gửi Request có Header: Authorization: Bearer <access_token>
   │
   ▼
[AppModule APP_GUARD]
   ├──► [AccessTokenGuard]
   │       ├── Kiểm tra @Public() ──► Cho phép nếu là route Public
   │       └── Passport JWT Strategy ──► Xác thực token & gán request.user = { userId, email, role }
   │
   └──► [RolesGuard]
           ├── Kiểm tra @Roles(...) metadata
           └── Nếu rỗng: Cho phép; Nếu có: verify request.user.role in @Roles(...)
```

- **Token Expiration**: Access token ngắn hạn; khi hết hạn, client gửi refresh token đến `POST /auth/refresh` (được bảo vệ bởi `RefreshTokenGuard`) để nhận cặp token mới.
- **Logout**: `POST /auth/logout` đọc `@CurrentUser('userId')` và đặt `user.refresh_token = null` trong DB.

---

## 5. Inventory & Stock Flow (Luồng quản lý kho & biến động tồn)

```
                           ┌───────────────────────────┐
                           │    Đơn hàng được tạo      │  status: pending
                           │  (POST /api/v1/order)     │  Chưa trừ tồn kho
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │   Duyệt xác nhận đơn      │  PATCH /order/:id/status
                           │     status: confirmed     │  (OrderService.confirmOrder)
                           └─────────────┬─────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
   [Kiểm tra tồn kho từng Item]                 [Đủ tồn kho -> Transaction]
   - Nếu tồn < đặt:                             - Giảm inventory.quantity
     throw BadRequestException                  - Tạo stock_movements (type: out)
                                                - Đổi order.status = confirmed
                                                              │
                                                              ▼
                                                ┌───────────────────────────┐
                                                │   Nếu HỦY ĐƠN (cancelled) │
                                                │   Cần hoàn tồn kho + tạo  │
                                                │   stock_movements (in)    │
                                                └───────────────────────────┘
```

- **Phiếu nhập/xuất kho trực tiếp ([`WarehouseService.createStockMovement`](file:///c:/vsCode/smart-logistics/src/modules/warehouse/warehouse.service.ts#L62))**:
  - Dùng trong nghiệp vụ nhập hàng từ nhà cung cấp hoặc điều chỉnh kho thủ công.
  - Sử dụng `upsert` trên `inventory` và bảo đảm số lượng tồn cuối cùng không âm.
- **Cảnh báo tồn kho thấp**:
  - Khi `inventory.quantity <= inventory.low_stock_threshold`, xuất hiện trong danh sách cảnh báo của `WarehouseModule` và `DashboardModule`.

---

## 6. Important Business Rules (Quy tắc nghiệp vụ cốt lõi)

### 6.1. Phân quyền người dùng (RBAC Matrix):
| Hành động / Endpoint | Admin | Warehouse Manager | Dispatcher | Driver |
| :--- | :---: | :---: | :---: | :---: |
| CRUD Kho hàng (`/warehouse`) | Full | Read-only | Read-only | ❌ |
| Nhập/Xuất kho & Xem tồn (`/warehouse/stock*`) | Full | Full | ❌ | ❌ |
| Quản lý Sản phẩm & Danh mục (`/product`, `/category`) | Full | Edit/Update | Read-only | Read-only |
| Tạo đơn hàng & Xem đơn (`/order`) | Full | Read-only | Full | Read-only |
| Tối ưu hóa & Điều phối lộ trình (`/route`) | Full | ❌ | Full | Read-only |
| Xem & Cập nhật hồ sơ cá nhân (`/user/me*`) | ✅ | ✅ | ✅ | ✅ |
| Cập nhật trạng thái chuyến / giao hàng | Full | ❌ | Full | Assigned Only |

### 6.2. Vòng đời đơn hàng (Order State Machine):
```
pending ──────► confirmed ──────► shipping ──────► delivered
   │                │                 │
   ▼                ▼                 ▼
cancelled        cancelled          failed
```
- Nghiêm cấm nhảy trạng thái bất hợp lệ (ví dụ: `pending` không thể nhảy thẳng lên `shipping` hay `delivered`).
- Đơn hàng đã ở trạng thái kết thúc (`delivered`, `failed`, `cancelled`) là bất biến.

### 6.3. Tối ưu hóa lộ trình (Route Optimization & TSP):
- Thuật toán giải bài toán người giao hàng (Traveling Salesperson Problem - TSP) kết hợp:
  1. **Nearest Neighbor**: Xây dựng lộ trình xuất phát từ kho (depot) đi qua toàn bộ điểm giao và quay về kho.
  2. **2-opt Improvement**: Hoán đổi các cạnh cắt nhau để tối thiểu hóa tổng quãng đường dựa trên công thức Haversine.
- Lộ trình tạo ra ở trạng thái `planned`. Khi phân công tài xế và xe (`assign`), tài xế phải đang ở trạng thái `available`.

### 6.4. Dự báo nhu cầu & Gợi ý nhập hàng (Forecast & Restock):
- Lấy tổng sản lượng xuất kho theo ngày của sản phẩm trong quá khứ $\rightarrow$ gửi sang FastAPI ML Service.
- Gợi ý số lượng cần nhập:
  $$\text{suggested\_restock} = \max(0, \lceil \text{predicted\_demand} - \text{current\_stock} + \text{safety\_stock} \rceil)$$
  Trong đó: $\text{safety\_stock} = \text{inventory.low\_stock\_threshold}$.

---

## 7. Identified Bugs & Inconsistencies (Danh mục lỗi phát hiện)

### 🔴 Lỗi Nghiêm trọng & Gây Lỗi Biên Dịch (Critical & Build Breaks):
1. **Lỗi biên dịch TypeScript do comment DTO ([`reorder-stops.dto.ts`](file:///c:/vsCode/smart-logistics/src/modules/vehicle/dto/reorder-stops.dto.ts))**:
   - `ReorderStopsDto` bị comment lại toàn bộ, khiến [`RouteController`](file:///c:/vsCode/smart-logistics/src/modules/route/route.controller.ts#L7) và [`RouteService`](file:///c:/vsCode/smart-logistics/src/modules/route/route.service.ts#L7) báo lỗi `TS2307: Cannot find module` khi build.
2. **Lỗi Runtime Crash tại [`DashboardService.getAlerts`](file:///c:/vsCode/smart-logistics/src/modules/dashboard/dashboard.service.ts#L71-L74)**:
   - Dòng 73 sử dụng `this.prisma.inventory.fields.low_stock_threshold` (Prisma Client không có thuộc tính `.fields` trên model delegate). Gọi `/dashboard/alerts` sẽ crash ngay lập tức với `TypeError: Cannot read properties of undefined`.
3. **Mất mát dữ liệu tồn kho khi Hủy đơn hàng đã xác nhận ([`OrderService.updateStatus`](file:///c:/vsCode/smart-logistics/src/modules/order/order.service.ts#L110-L113))**:
   - Chuyển đơn từ `confirmed` sang `cancelled` chỉ cập nhật cột trạng thái đơn mà không cộng lại số lượng vào `inventory.quantity`, cũng không ghi nhận `stockMovement` (type: `'in'`). Tồn kho bị thất thoát vĩnh viễn trong hệ thống.
4. **Sai lệch khoảng ngày trong [`ForecastService.backfillActuals`](file:///c:/vsCode/smart-logistics/src/modules/forecast/forecast.service.ts#L104-L117)**:
   - Truy vấn `pendingForecasts` thiếu `orderBy: { forecast_date: 'asc' }`. Lấy phần tử đầu `[0]` và phần tử cuối `[length - 1]` có thể khiến `minDate > maxDate`, dẫn đến việc quét stock movements rỗng và không cập nhật được sản lượng thực tế.

### 🟡 Điểm Bất hợp lý & Lỗi Nghiệp vụ / Thiết kế:
5. **Bỏ qua lọc Soft-delete của Sản phẩm ([`ProductService`](file:///c:/vsCode/smart-logistics/src/modules/product/product.service.ts#L33-L52))**:
   - Hàm `remove()` gán `deletedAt = new Date()`, nhưng `findAll()` và `findOne()` không lọc `deletedAt: null`. Người dùng vẫn xem và đặt được hàng đã xóa mềm.
6. **Trạng thái tài xế `on_route` không bao giờ được kích hoạt tự động**:
   - Khi gán lộ trình (`RouteService.assign`) hay khi tài xế gửi tọa độ GPS qua WebSocket, trạng thái `driver.status` không chuyển sang `on_route`. Hệ thống khiến API `getActiveDrivers()` trên Dashboard luôn trả về danh sách rỗng.
7. **Thiếu validation biên độ dữ liệu trong [`CreateOrderDto`](file:///c:/vsCode/smart-logistics/src/modules/order/dto/create-order.dto.ts)**:
   - `items` và `delivery_points` thiếu decorator `@ArrayMinSize(1)`, cho phép tạo đơn hàng 0 sản phẩm.
   - `CreateOrderItemDto.quantity` thiếu decorator `@Min(1)`, cho phép đặt số lượng âm hoặc bằng 0.
8. **Thiếu Global Exception Filter cho lỗi Prisma**:
   - Các lỗi ngoại lệ như `P2002` (Unique Constraint), `P2025` (Record not found khi dùng `findUniqueOrThrow`) hiện văng ra mã lỗi 500 kèm chi tiết truy vấn DB, chưa được chuẩn hóa về 404 / 409 / 400.
9. **Thiếu Validation Pipe cho WebSocket Gateway ([`TrackingGateway`](file:///c:/vsCode/smart-logistics/src/modules/tracking/tracking.gateway.ts))**:
   - Sự kiện `driver:location` và `delivery:status-update` nhận payload thô không qua class validation DTO.

---

## 8. Files That Need Changes & Recommended Fixes (Danh sách file & Hướng khắc phục)

> *Lưu ý: Bảng dưới đây liệt kê các file cần chỉnh sửa kèm mã minh họa giải pháp. Không chỉnh sửa code trực tiếp khi chưa có yêu cầu.*

### 1. [`src/modules/route/dto/reorder-stops.dto.ts`](file:///c:/vsCode/smart-logistics/src/modules/route/dto/reorder-stops.dto.ts) & [`src/modules/route/route.controller.ts`](file:///c:/vsCode/smart-logistics/src/modules/route/route.controller.ts)
- **Vấn đề**: File DTO bị đặt nhầm bên `vehicle/dto` và đang bị comment gây lỗi build.
- **Khắc phục**:
  - Tạo file `src/modules/route/dto/reorder-stops.dto.ts`:
    ```typescript
    import { IsArray, IsUUID } from 'class-validator';

    export class ReorderStopsDto {
      @IsArray()
      @IsUUID('4', { each: true })
      stop_ids: string[];
    }
    ```
  - Xóa file cũ tại `src/modules/vehicle/dto/reorder-stops.dto.ts`.
  - Sửa lại import trong [`route.controller.ts`](file:///c:/vsCode/smart-logistics/src/modules/route/route.controller.ts#L7) và [`route.service.ts`](file:///c:/vsCode/smart-logistics/src/modules/route/route.service.ts#L7):
    ```typescript
    import { ReorderStopsDto } from './dto/reorder-stops.dto.js';
    ```

### 2. [`src/modules/dashboard/dashboard.service.ts`](file:///c:/vsCode/smart-logistics/src/modules/dashboard/dashboard.service.ts)
- **Vấn đề**: Đoạn code lỗi `this.prisma.inventory.fields` làm crash API `/dashboard/alerts`.
- **Khắc phục**: Xóa bỏ đoạn `this.prisma.inventory.findMany` thừa ở dòng 71–79, chỉ giữ lại `$queryRaw`:
  ```typescript
  async getAlerts() {
    const lowStockAlerts = await this.prisma.$queryRaw<Array<{
      product_id: string;
      product_name: string;
      sku: string;
      warehouse_name: string;
      quantity: number;
      low_stock_threshold: number;
    }>>`
      SELECT i.product_id, p.name as product_name, p.sku,
             w.name as warehouse_name, i.quantity, i.low_stock_threshold
      FROM inventories i
      JOIN products p ON p.id = i.product_id
      JOIN warehouses w ON w.id = i.warehouse_id
      WHERE i.quantity <= i.low_stock_threshold
    `;

    return {
      low_stock: lowStockAlerts,
      generated_at: new Date().toISOString(),
    };
  }
  ```

### 3. [`src/modules/order/order.service.ts`](file:///c:/vsCode/smart-logistics/src/modules/order/order.service.ts)
- **Vấn đề**: Không hoàn trả tồn kho khi đơn hàng chuyển từ `confirmed` sang `cancelled`.
- **Khắc phục**: Trong `updateStatus`, bổ sung nhánh xử lý hoàn tồn kho khi hủy đơn đã xác nhận:
  ```typescript
  if (dto.status === OrderStatus.cancelled && order.status === OrderStatus.confirmed) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            warehouse_id: order.warehouse_id,
            type: 'in',
            quantity: item.quantity,
            reference_order_id: order.id,
          },
        });
        await tx.inventory.update({
          where: {
            product_id_warehouse_id: {
              product_id: item.product_id,
              warehouse_id: order.warehouse_id,
            },
          },
          data: { quantity: { increment: item.quantity } },
        });
      }
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.cancelled },
      });
    });
  }
  ```

### 4. [`src/modules/forecast/forecast.service.ts`](file:///c:/vsCode/smart-logistics/src/modules/forecast/forecast.service.ts)
- **Vấn đề**: Hàm `backfillActuals` lấy ngày min/max bị sai thứ tự; ném generic `Error` thay vì HTTP Exception.
- **Khắc phục**:
  - Thêm `orderBy: { forecast_date: 'asc' }` vào query `pendingForecasts`.
  - Trong `runForecast`, thay `throw new Error(...)` bằng `throw new BadRequestException("No historical data for this product")`.

### 5. [`src/modules/product/product.service.ts`](file:///c:/vsCode/smart-logistics/src/modules/product/product.service.ts)
- **Vấn đề**: Các API đọc dữ liệu vẫn trả về sản phẩm đã xóa mềm (`deletedAt != null`).
- **Khắc phục**: Thêm điều kiện `{ deletedAt: null }` vào mệnh đề `where` của `findAll()` và `findOne()`.

### 6. [`src/modules/order/dto/create-order.dto.ts`](file:///c:/vsCode/smart-logistics/src/modules/order/dto/create-order.dto.ts)
- **Vấn đề**: Cho phép tạo đơn hàng 0 sản phẩm hoặc số lượng sản phẩm không dương.
- **Khắc phục**: Thêm `@ArrayMinSize(1)` vào `items`, `delivery_points` và thêm `@Min(1)` vào `CreateOrderItemDto.quantity`.

### 7. [`src/modules/tracking/tracking.gateway.ts`](file:///c:/vsCode/smart-logistics/src/modules/tracking/tracking.gateway.ts)
- **Vấn đề**: Tài xế không bao giờ tự động chuyển sang `on_route`, thiếu validation socket payload.
- **Khắc phục**: Khi nhận sự kiện `driver:location`, cập nhật `driver.status = DriverStatus.on_route` nếu tài xế đang gắn với một lộ trình `in_progress`.

---

## 9. Bảng tổng hợp trạng thái các vấn đề vừa được giải quyết (Recent Updates)

| Thành phần | Thay đổi gần nhất của User | Trạng thái hiện tại |
| :--- | :--- | :--- |
| **`AppModule`** | Đã bỏ comment kích hoạt `APP_GUARD` cho `AccessTokenGuard` và `RolesGuard` | ✅ Đã bảo vệ toàn bộ route |
| **`VehicleService`** | Đã sửa `findOne` và `findAll` trỏ đúng vào bảng `prisma.vehicle` | ✅ Đã khắc phục lỗi copy-paste |
| **`ForecastController`** | Đã thêm decorator `@Body()` vào hàm `backfillActuals` | ✅ Hết lỗi undefined payload |
| **`AccessTokenStrategy`** | Đã chuyển sang `ExtractJwt.fromAuthHeaderAsBearerToken()` | ✅ Chuẩn hóa Bearer token |
| **`UserController`** | Đã bỏ giới hạn `@Roles(Role.ADMIN, Role.DRIVER)` trên `getProfile` | ✅ Tất cả user đều xem được profile mình |
| **`OrderController`** | Đã dùng `UpdateOrderStatusDto` thay cho inline type `{ status }` | ✅ Đã có validation class-validator |

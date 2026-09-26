# Task Breakdown — Smart Logistics Platform (theo SRS v1.0)

Dựa trên `Smart_Logistics_Platform_SRS.md`, bám theo 5 giai đoạn ở Mục 8 (Kế hoạch triển khai) và phạm vi MVP ở Mục 10.1. Mã FR trong ngoặc tham chiếu Mục 4 của SRS để truy vết.

## Giai đoạn 1 (Tuần 1–3) — Setup core: Auth, Product, Warehouse, Order

- [ ] 1. Setup project: NestJS core service + FastAPI service (skeleton riêng), Docker Compose, PostgreSQL + Prisma ORM — theo cấu trúc trong skill `manual-coding-workflow`
- [ ] 2. AuthModule: đăng ký/đăng nhập, JWT access + refresh token, tái dùng pattern từ dự án Jira clone trước đó (FR-AUTH-01, FR-AUTH-02)
- [ ] 3. RBAC guard theo 4 vai trò (Admin, Warehouse Manager, Dispatcher, Driver) + quản lý hồ sơ cá nhân (FR-AUTH-03, FR-AUTH-04)
- [ ] 4. ProductModule: CRUD sản phẩm, phân loại danh mục, tìm kiếm/lọc (FR-PROD-01, FR-PROD-02, FR-PROD-03)
- [ ] 5. WarehouseModule: CRUD kho hàng, theo dõi tồn kho theo (sản phẩm, kho) (FR-WH-01, FR-WH-02)
- [ ] 6. WarehouseModule: phiếu nhập/xuất kho (stock_movements) + cảnh báo tồn kho thấp + lịch sử biến động (FR-WH-03, FR-WH-04, FR-WH-05)
- [ ] 7. OrderModule: tạo đơn hàng (order_items, delivery_points), quản lý vòng đời trạng thái, lập kế hoạch giao theo ngày (FR-ORD-01, FR-ORD-02, FR-ORD-04)

## Giai đoạn 2 (Tuần 4–6) — Route Optimization

- [ ] 8. Thiết kế API contract `/routes/optimize` giữa NestJS và FastAPI: nhận danh sách điểm giao + ràng buộc (FR-RT-01)
- [ ] 9. Cài thuật toán TSP đơn xe (Nearest Neighbor + 2-opt) — nâng cấp sang OR-Tools nếu còn thời gian (FR-RT-02)
- [ ] 10. RouteModule: gán tuyến cho tài xế/xe, hiển thị tuyến trên bản đồ, cho phép điều chỉnh thủ công (FR-RT-03, FR-RT-04, FR-RT-05)

## Giai đoạn 3 (Tuần 7–9) — Forecast Service

- [ ] 11. Setup FastAPI service với endpoint `/predict` (skeleton) + cơ chế NestJS gọi sang FastAPI
- [ ] 12. Viết seed script sinh dữ liệu lịch sử bán hàng/xuất kho giả lập (ít nhất vài tháng dữ liệu)
- [ ] 13. Cài mô hình dự báo Prophet hoặc ARIMA, hoàn thiện endpoint `/predict`, lưu kết quả vào bảng `forecasts` (FR-FC-01, FR-FC-02)
- [ ] 14. So sánh dự đoán vs thực tế + tính chỉ số MAE/RMSE/MAPE (FR-FC-03, FR-FC-04)
- [ ] 15. OrderModule: sinh gợi ý số lượng nhập hàng dựa trên kết quả forecast (FR-ORD-03)

## Giai đoạn 4 (Tuần 10–12) — Real-time Tracking & Dashboard

- [ ] 16. TrackingModule: WebSocket namespace `/tracking`, tài xế emit vị trí định kỳ (FR-TRK-01)
- [ ] 17. Dashboard: hiển thị vị trí tài xế real-time trên bản đồ (FR-TRK-02, FR-DASH-02)
- [x] 18. Giao diện tài xế (web responsive theo MVP): xem tuyến hiện tại, cập nhật trạng thái điểm giao (FR-TRK-03, FR-TRK-04)
- [x] 19. Dashboard tổng hợp: KPI tổng quan, biểu đồ dự báo theo sản phẩm, danh sách cảnh báo hệ thống (FR-DASH-01, FR-DASH-03, FR-DASH-04)

## Giai đoạn 5 (Tuần 13+) — Hoàn thiện

- [x] 20. Kiểm thử toàn hệ thống, xử lý fallback khi FastAPI service lỗi/timeout, viết báo cáo đồ án, chuẩn bị bảo vệ

---

*Lưu ý quan trọng: SRS v1.0 định nghĩa giao diện tài xế trong MVP là **web responsive**, không phải Flutter mobile — khác với quyết định Flutter trước đó. Flutter/mobile app native được xếp vào Mục 10.2 (mở rộng nếu còn thời gian), không phải bắt buộc.*

*Cách dùng: đánh dấu `[x]` khi hoàn thành; paste lại file này vào chat để tiếp tục đúng chỗ đang làm dở.*

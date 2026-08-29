**SMART LOGISTICS PLATFORM**

*Tối ưu tuyến giao hàng + Dự đoán nhu cầu tồn kho*

**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**

(Software Requirements Specification --- SRS)

**Phiên bản:** 1.0

**Ngày cập nhật:** 29/08/2026

**Người thực hiện:** \[Điền tên sinh viên / nhóm thực hiện\]

**Giảng viên hướng dẫn:** \[Điền tên GVHD\]

**Trạng thái tài liệu:** Bản nháp làm việc (Working Draft)

**Lịch sử chỉnh sửa tài liệu**

  -------------------------------------------------------------------------
  **Phiên   **Ngày**       **Người cập       **Nội dung thay đổi**
  bản**                    nhật**            
  --------- -------------- ----------------- ------------------------------
  1.0       29/08/2026     ---               Khởi tạo tài liệu SRS từ ý
                                             tưởng đề tài ban đầu (kết hợp
                                             Forecast + Route Optimization)

  -------------------------------------------------------------------------

**MỤC LỤC**

*Mục lục sẽ tự động điền số trang khi mở bằng Microsoft Word. Nếu chưa
thấy số trang, hãy bấm chọn mục lục rồi nhấn F9 (hoặc chuột phải →
Update Field).*

1\. Giới thiệu

1.1 Mục đích tài liệu

Tài liệu này đặc tả các yêu cầu chức năng và phi chức năng của hệ thống
Smart Logistics Platform --- nền tảng kết hợp tối ưu tuyến giao hàng và
dự đoán nhu cầu tồn kho. Mục tiêu là làm rõ phạm vi, kiến trúc, luồng
nghiệp vụ và các ràng buộc kỹ thuật, làm cơ sở cho việc thiết kế, triển
khai, kiểm thử và là tài liệu tham chiếu xuyên suốt quá trình làm đồ án,
kể cả khi trình bày trước hội đồng.

1.2 Phạm vi hệ thống

Hệ thống phục vụ nghiệp vụ logistics quy mô vừa (một đơn vị phân
phối/bán lẻ có nhiều kho và đội xe giao hàng nội thành), gồm ba khối
chức năng liên kết chặt với nhau:

-   **Quản lý vận hành lõi: sản phẩm, kho, đơn hàng, tài khoản và phân
    quyền người dùng.**

-   **Dự đoán nhu cầu tồn kho dựa trên lịch sử bán hàng bằng mô hình
    thống kê/học máy (Prophet, ARIMA).**

-   **Tối ưu tuyến giao hàng và theo dõi tài xế theo thời gian thực.**

Hai khối sau cùng là trọng tâm của đề tài: kết quả dự báo quyết định
giao bao nhiêu và khi nào, còn route optimization quyết định giao bằng
cách nào cho tối ưu --- dữ liệu giữa hai module này nuôi lẫn nhau thay
vì tách rời.

1.3 Đối tượng sử dụng tài liệu

-   Sinh viên / nhóm thực hiện đồ án --- dùng làm kim chỉ nam trong suốt
    quá trình phát triển.

-   Giảng viên hướng dẫn và hội đồng phản biện --- dùng để đánh giá phạm
    vi, tính khả thi và mức độ hoàn thiện.

-   Lập trình viên tham gia sau này (nếu mở rộng nhóm) --- dùng để
    onboard nhanh vào dự án.

1.4 Định nghĩa, từ viết tắt, thuật ngữ

  -----------------------------------------------------------------------
  **Viết tắt**   **Giải nghĩa**
  -------------- --------------------------------------------------------
  SRS            Software Requirements Specification -- Tài liệu đặc tả
                 yêu cầu phần mềm

  RBAC           Role-Based Access Control -- Kiểm soát truy cập theo vai
                 trò

  JWT            JSON Web Token -- Chuẩn token xác thực đăng nhập

  TSP            Traveling Salesman Problem -- bài toán định tuyến 1 xe
                 qua nhiều điểm

  VRP            Vehicle Routing Problem -- bài toán định tuyến nhiều xe,
                 nhiều ràng buộc

  OR-Tools       Thư viện tối ưu hoá mã nguồn mở của Google, hỗ trợ giải
                 TSP/VRP

  Prophet        Thư viện dự báo chuỗi thời gian nguồn mở do Meta
                 (Facebook) phát triển

  ARIMA          AutoRegressive Integrated Moving Average -- mô hình dự
                 báo chuỗi thời gian cổ điển

  MAE / RMSE /   Các chỉ số đo sai số của mô hình dự báo, dùng để chứng
  MAPE           minh độ chính xác

  ETA            Estimated Time of Arrival -- thời gian đến dự kiến tại
                 điểm giao

  ORM            Object-Relational Mapping -- công cụ ánh xạ đối tượng
                 sang quan hệ CSDL

  MVP            Minimum Viable Product -- phiên bản tối thiểu khả dụng
  -----------------------------------------------------------------------

1.5 Tài liệu tham khảo

-   Chuẩn đặc tả yêu cầu phần mềm IEEE 830 (tham khảo cấu trúc trình
    bày).

-   Tài liệu chính thức NestJS --- docs.nestjs.com

-   Tài liệu chính thức FastAPI --- fastapi.tiangolo.com

-   Tài liệu chính thức Prisma ORM --- prisma.io/docs

-   Tài liệu Google OR-Tools --- developers.google.com/optimization

-   Tài liệu Prophet --- facebook.github.io/prophet

2\. Mô tả tổng quan

2.1 Bối cảnh và động lực

Trong vận hành logistics/bán lẻ thực tế, hai bài toán "dự đoán cần bao
nhiêu hàng" và "giao hàng thế nào cho tối ưu" thường được xử lý tách
rời, dẫn đến tồn kho dư thừa hoặc thiếu hụt không khớp với kế hoạch giao
hàng thực tế. Smart Logistics Platform giải quyết vấn đề này bằng cách
liên kết trực tiếp dữ liệu giữa Forecast Module và Route Optimization
Module, để hai bài toán thật sự "nuôi dữ liệu cho nhau" thay vì hoạt
động độc lập.

2.2 Tổng quan giải pháp

Hệ thống gồm hai module lõi liên kết chặt (Forecast Module và Route
Optimization Module), cùng các module hỗ trợ nghiệp vụ nền (Auth,
Product, Warehouse, Order) và module giám sát (Tracking, Dashboard).
Kiến trúc áp dụng mô hình polyglot microservices: NestJS đảm nhiệm
nghiệp vụ + real-time, Python/FastAPI đảm nhiệm tính toán ML/tối ưu ---
thể hiện tư duy dùng đúng công cụ cho đúng việc thay vì cố nhét tất cả
vào một ngôn ngữ.

2.3 Luồng nghiệp vụ tổng thể

Sơ đồ dưới đây mô tả luồng dữ liệu xuyên suốt hệ thống, từ dữ liệu lịch
sử đến hành động vận hành cụ thể và vòng phản hồi liên tục:

![](media/a66dc3040bc10583bef32abf6a49b490ff49db9d.png){width="6.25in"
height="2.1875in"}

*Hình 1. Luồng nghiệp vụ tổng thể của Smart Logistics Platform*

-   Lịch sử bán hàng (dữ liệu stock_movements, orders) được tổng hợp
    theo sản phẩm và theo thời gian.

-   Forecast Module chạy mô hình (Prophet/ARIMA) để dự đoán nhu cầu
    trong kỳ tới.

-   Kết quả dự đoán sinh ra gợi ý đơn nhập hàng và kế hoạch giao hàng
    (số lượng, thời điểm).

-   Route Optimization Module nhận danh sách điểm giao trong kế hoạch,
    tính tuyến tối ưu.

-   Dashboard tổng hợp hiển thị real-time: vị trí tài xế, tình trạng tồn
    kho, biểu đồ dự báo.

2.4 Đối tượng người dùng (User Classes)

  ------------------------------------------------------------------------
  **Vai trò**    **Mô tả**            **Quyền hạn chính**
  -------------- -------------------- ------------------------------------
  Quản trị viên  Quản lý toàn hệ      Toàn quyền cấu hình, phân quyền, xem
  (Admin)        thống                mọi báo cáo và số liệu

  Quản lý kho    Vận hành kho hàng    Quản lý sản phẩm, tồn kho, duyệt
  (Warehouse                          phiếu nhập/xuất, xem dự báo
  Manager)                            

  Điều phối viên Lập kế hoạch giao    Tạo/duyệt đơn hàng, chạy tối ưu
  (Dispatcher)   hàng                 tuyến, gán tài xế và phương tiện

  Tài xế         Thực hiện giao hàng  Xem tuyến được gán, cập nhật vị trí
  (Driver)                            và trạng thái giao hàng

  Khách hàng (mở Đặt hàng, theo dõi   Tạo đơn hàng, xem trạng thái đơn
  rộng)          đơn                  hàng của mình
  ------------------------------------------------------------------------

2.5 Môi trường vận hành

-   Server backend: Node.js (NestJS) + Python (FastAPI), container hoá
    riêng biệt bằng Docker, có thể deploy độc lập.

-   Cơ sở dữ liệu & ORM: PostgreSQL + Prisma ORM --- phù hợp dữ liệu quan
    hệ, quản lý schema/migrations chặt chẽ và cung cấp type-safe client
    cho NestJS, hỗ trợ tốt kiểu dữ liệu địa lý (mở rộng PostGIS về sau nếu cần).

-   Web dashboard: chạy trên trình duyệt hiện đại (Chrome, Edge,
    Firefox).

-   Giao diện tài xế: web responsive đơn giản ở giai đoạn đầu; mobile
    app native là hướng mở rộng.

-   Bản đồ & định tuyến nền: cần chốt 1 trong các nhà cung cấp ---
    Google Maps Platform / Mapbox / OpenStreetMap + OSRM, dựa trên chi
    phí và giới hạn API key khi làm đồ án.

2.6 Giả định và ràng buộc

-   Giả định dữ liệu lịch sử bán hàng đủ dài (tối thiểu vài tháng) để mô
    hình forecast học được xu hướng/mùa vụ; nếu dữ liệu thật không đủ,
    dùng seed script sinh dữ liệu giả lập.

-   Giả định số điểm giao trong 1 tuyến ở quy mô vừa phải (dưới 100
    điểm/xe/ngày) để thuật toán tối ưu chạy trong thời gian chấp nhận
    được.

-   Ràng buộc thời gian đồ án (\~3-4 tháng) giới hạn độ phức tạp bài
    toán tối ưu --- ưu tiên TSP đơn xe trước khi mở rộng VRP đa xe.

-   Ràng buộc nhân lực: nhóm nhỏ cần làm quen công nghệ mới (FastAPI)
    trong thời gian ngắn.

3\. Kiến trúc hệ thống

3.1 Kiến trúc tổng thể --- Polyglot Microservices

Hệ thống gồm hai service chính, mỗi service dùng công nghệ phù hợp nhất
với vai trò của nó:

-   NestJS Core Service: đảm nhiệm nghiệp vụ chính (CRUD, xác thực, phân
    quyền) và giao tiếp thời gian thực (WebSocket) --- tận dụng hệ sinh
    thái TypeScript, đồng thời tái sử dụng pattern AuthModule (JWT,
    RBAC) đã có kinh nghiệm từ dự án Jira clone trước đó.

-   Python ML Service (FastAPI): đảm nhiệm các tác vụ khoa học dữ liệu
    --- dự báo chuỗi thời gian (Prophet/ARIMA) và tối ưu tổ hợp
    (OR-Tools) --- tận dụng hệ sinh thái thư viện ML/OR mạnh nhất hiện
    có của Python.

Hai service giao tiếp qua REST API nội bộ: NestJS đóng vai trò client,
gọi sang FastAPI khi cần dự báo hoặc tối ưu tuyến, sau đó lưu kết quả
vào cơ sở dữ liệu dùng chung và trả về cho client.

3.2 Sơ đồ kiến trúc

![](media/ac38546eb1125ccfaa9fb3e5341ee41c67867d8a.png){width="5.833333333333333in"
height="3.9583333333333335in"}

*Hình 2. Kiến trúc polyglot microservices --- NestJS (nghiệp vụ +
real-time) kết hợp FastAPI (ML/tối ưu)*

3.3 Công nghệ sử dụng (Tech Stack)

  -----------------------------------------------------------------------
  **Thành phần**     **Công nghệ đề     **Vai trò**
                     xuất**             
  ------------------ ------------------ ---------------------------------
  Backend nghiệp vụ  NestJS             REST API, WebSocket Gateway, xử
                     (TypeScript)       lý business logic

  Backend ML / Tối   Python 3 + FastAPI Forecasting và Route Optimization
  ưu                                    dạng service riêng

  Cơ sở dữ liệu      PostgreSQL (đề     Lưu trữ dữ liệu quan hệ, hỗ trợ
                     xuất)              tốt kiểu dữ liệu toạ độ

  ORM / Truy cập     Prisma ORM         Quản lý schema, database migration
  dữ liệu                               và truy vấn type-safe trong NestJS

  Dự báo nhu cầu     Prophet / ARIMA    Mô hình dự báo chuỗi thời gian
                     (statsmodels)      theo sản phẩm

  Tối ưu tuyến đường OR-Tools, hoặc     Giải bài toán TSP (giai đoạn đầu)
                     Nearest Neighbor + / VRP (mở rộng)
                     2-opt (JS)         

  Giao tiếp thời     WebSocket (NestJS  Cập nhật vị trí tài xế, trạng
  gian thực          Gateway /          thái giao hàng real-time
                     Socket.IO)         

  Bản đồ & định      Google Maps /      Hiển thị bản đồ, tính khoảng cách
  tuyến nền          Mapbox / OSM +     & thời gian di chuyển
                     OSRM (cần chốt)    

  Xác thực & phân    JWT + RBAC         Đăng nhập, kiểm soát truy cập
  quyền                                 theo vai trò

  Triển khai         Docker, Docker     Đóng gói và chạy song song 2
                     Compose            service độc lập

  Frontend Dashboard React / Next.js    Giao diện quản trị, bản đồ và
                     (đề xuất)          biểu đồ real-time
  -----------------------------------------------------------------------

3.4 Giao tiếp giữa các service

-   NestJS → FastAPI: REST API đồng bộ (HTTP POST), dùng khi cần
    forecast hoặc tối ưu tuyến theo yêu cầu.

-   FastAPI → NestJS: trả kết quả JSON (dự đoán hoặc tuyến tối ưu);
    NestJS chịu trách nhiệm lưu DB và trả về client.

-   NestJS ↔ Client/Driver: WebSocket cho cập nhật vị trí và trạng thái
    real-time.

-   Hướng mở rộng: dùng Message Queue (RabbitMQ/BullMQ) cho các tác vụ
    forecast chạy nền/định kỳ, tránh block request đồng bộ khi tập dữ
    liệu lớn.

4\. Yêu cầu chức năng

Mục này liệt kê yêu cầu chức năng theo từng module, bám sát kiến trúc
NestJS đề xuất ở Mục 3. Mỗi yêu cầu có mã định danh riêng (dùng để truy
vết khi thiết kế use case, viết test, hoặc báo cáo tiến độ), kèm mức ưu
tiên (Cao / Trung bình / Thấp) để hỗ trợ lập kế hoạch theo timeline ở
Mục 8.

4.1 Module Xác thực & Phân quyền (AuthModule)

*Tái sử dụng pattern JWT + RBAC đã có kinh nghiệm từ dự án Jira clone
trước đó.*

  --------------------------------------------------------------------------------
  **Mã**           **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  ---------------- --------------- ---------------------------------- ------------
  **FR-AUTH-01**   **Đăng ký /     Người dùng đăng ký tài khoản, đăng **Cao**
                   Đăng nhập**     nhập bằng email/mật khẩu; hệ thống 
                                   trả về JWT access token và refresh 
                                   token.                             

  **FR-AUTH-02**   **Làm mới       Hỗ trợ refresh token khi access    **Trung
                   token**         token hết hạn, không yêu cầu đăng  bình**
                                   nhập lại.                          

  **FR-AUTH-03**   **Phân quyền    Kiểm soát truy cập chức năng theo  **Cao**
                   theo vai trò**  vai trò (Admin, Warehouse Manager, 
                                   Dispatcher, Driver) bằng RBAC      
                                   guard.                             

  **FR-AUTH-04**   **Quản lý hồ sơ Người dùng xem/cập nhật thông tin  **Thấp**
                   cá nhân**       cá nhân, đổi mật khẩu.             
  --------------------------------------------------------------------------------

4.2 Module Quản lý Sản phẩm (ProductModule)

  --------------------------------------------------------------------------------
  **Mã**           **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  ---------------- --------------- ---------------------------------- ------------
  **FR-PROD-01**   **CRUD sản      Admin/Warehouse Manager thêm, sửa, **Cao**
                   phẩm**          xoá, xem danh sách sản phẩm (SKU,  
                                   tên, danh mục, đơn vị tính, giá).  

  **FR-PROD-02**   **Phân loại     Sản phẩm được gán vào danh mục để  **Trung
                   danh mục**      hỗ trợ báo cáo và forecast theo    bình**
                                   nhóm sản phẩm.                     

  **FR-PROD-03**   **Tìm kiếm &    Người dùng tìm kiếm sản phẩm theo  **Trung
                   lọc**           tên, SKU hoặc danh mục.            bình**
  --------------------------------------------------------------------------------

4.3 Module Quản lý Kho (WarehouseModule)

*Nguồn dữ liệu nền quan trọng nhất cho Forecast Module --- cần thiết kế
chuẩn ngay từ đầu.*

  ------------------------------------------------------------------------------
  **Mã**         **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  -------------- --------------- ---------------------------------- ------------
  **FR-WH-01**   **CRUD kho      Quản lý danh sách kho: tên, địa    **Cao**
                 hàng**          chỉ, toạ độ (lat/lng).             

  **FR-WH-02**   **Theo dõi tồn  Lưu và cập nhật số lượng tồn theo  **Cao**
                 kho**           từng cặp (sản phẩm, kho).          

  **FR-WH-03**   **Ghi nhận      Tạo phiếu nhập/xuất kho            **Cao**
                 phiếu           (stock_movements), tự động cập     
                 nhập/xuất**     nhật số lượng tồn.                 

  **FR-WH-04**   **Cảnh báo tồn  Cảnh báo khi tồn kho dưới ngưỡng   **Trung
                 kho thấp**      an toàn hoặc thấp hơn nhu cầu dự   bình**
                                 báo.                               

  **FR-WH-05**   **Lịch sử biến  Xem lịch sử nhập/xuất theo sản     **Cao**
                 động**          phẩm/kho/thời gian --- dữ liệu đầu 
                                 vào cho Forecast Module.           
  ------------------------------------------------------------------------------

4.4 Module Quản lý Đơn hàng (OrderModule)

  -------------------------------------------------------------------------------
  **Mã**          **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  --------------- --------------- ---------------------------------- ------------
  **FR-ORD-01**   **Tạo đơn       Tạo đơn hàng gồm danh sách sản     **Cao**
                  hàng**          phẩm, số lượng, điểm giao (địa     
                                  chỉ + lat/lng).                    

  **FR-ORD-02**   **Quản lý trạng Theo dõi vòng đời đơn hàng: chờ xử **Cao**
                  thái**          lý → đã xác nhận → đang giao → đã  
                                  giao / thất bại → huỷ.             

  **FR-ORD-03**   **Gợi ý đơn     Sinh gợi ý số lượng cần nhập dựa   **Cao**
                  nhập hàng**     trên kết quả từ Forecast Module.   

  **FR-ORD-04**   **Lập kế hoạch  Gom các đơn hàng cần giao trong    **Cao**
                  giao hàng theo  ngày thành danh sách điểm giao,    
                  ngày**          chuyển sang Route Module.          
  -------------------------------------------------------------------------------

4.5 Module Tối ưu Tuyến đường (RouteModule)

*Bắt đầu với TSP đơn xe; chỉ mở rộng VRP đa xe nếu còn thời gian (xem
rủi ro ở Mục 9).*

  ------------------------------------------------------------------------------
  **Mã**         **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  -------------- --------------- ---------------------------------- ------------
  **FR-RT-01**   **Nhận danh     Nhận danh sách điểm giao trong     **Cao**
                 sách điểm       ngày (từ OrderModule) kèm ràng     
                 giao**          buộc nếu có (khung giờ, khối       
                                 lượng).                            

  **FR-RT-02**   **Gọi thuật     Gửi yêu cầu tối ưu sang FastAPI    **Cao**
                 toán tối ưu**   (OR-Tools) hoặc chạy thuật toán    
                                 nội bộ (Nearest Neighbor + 2-opt), 
                                 nhận thứ tự điểm giao tối ưu.      

  **FR-RT-03**   **Gán tuyến cho Gán tuyến đã tối ưu cho một tài xế **Cao**
                 tài xế/xe**     và phương tiện cụ thể.             

  **FR-RT-04**   **Xem tuyến     Hiển thị trực quan tuyến đã tối ưu **Trung
                 trên bản đồ**   trên bản đồ: thứ tự điểm dừng,     bình**
                                 khoảng cách, thời gian ước tính.   

  **FR-RT-05**   **Điều chỉnh    Điều phối viên có thể điều chỉnh   **Thấp**
                 thủ công**      thứ tự điểm giao thủ công khi cần  
                                 (ví dụ ưu tiên khách VIP).         
  ------------------------------------------------------------------------------

4.6 Module Theo dõi Real-time (TrackingModule)

  -------------------------------------------------------------------------------
  **Mã**          **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  --------------- --------------- ---------------------------------- ------------
  **FR-TRK-01**   **Cập nhật vị   Ứng dụng tài xế gửi toạ độ hiện    **Cao**
                  trí tài xế**    tại định kỳ qua WebSocket.         

  **FR-TRK-02**   **Hiển thị vị   Dashboard hiển thị vị trí các tài  **Cao**
                  trí trên bản    xế đang hoạt động theo thời gian   
                  đồ**            thực.                              

  **FR-TRK-03**   **Cập nhật      Tài xế đánh dấu điểm giao đã hoàn  **Cao**
                  trạng thái điểm thành/thất bại kèm ghi chú.        
                  giao**                                             

  **FR-TRK-04**   **Lịch sử hành  Lưu lịch sử di chuyển thực tế để   **Trung
                  trình**         đối chiếu với tuyến đã tối ưu,     bình**
                                  đánh giá độ chính xác thuật toán.  
  -------------------------------------------------------------------------------

4.7 Module Dự báo Nhu cầu (ForecastModule)

*Kết quả của module này là minh chứng định lượng quan trọng khi bảo vệ
đồ án.*

  ------------------------------------------------------------------------------
  **Mã**         **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  -------------- --------------- ---------------------------------- ------------
  **FR-FC-01**   **Gửi dữ liệu   NestJS tổng hợp dữ liệu lịch sử    **Cao**
                 lịch sử**       bán hàng/xuất kho, gửi sang        
                                 FastAPI để dự đoán.                

  **FR-FC-02**   **Nhận & lưu    Nhận kết quả dự đoán (theo sản     **Cao**
                 kết quả dự      phẩm, theo thời gian) từ FastAPI,  
                 đoán**          lưu vào bảng forecasts.            

  **FR-FC-03**   **So sánh dự    Hiển thị biểu đồ so sánh giá trị   **Cao**
                 đoán vs thực    dự đoán và giá trị thực tế theo    
                 tế**            thời gian.                         

  **FR-FC-04**   **Tính độ chính Tính các chỉ số MAE/RMSE/MAPE để   **Cao**
                 xác mô hình**   đánh giá và trình bày trước hội    
                                 đồng.                              

  **FR-FC-05**   **Lên lịch chạy Tự động chạy lại forecast theo chu **Thấp**
                 định kỳ**       kỳ (ví dụ hàng tuần).              
  ------------------------------------------------------------------------------

4.8 Module Dashboard Tổng hợp

  --------------------------------------------------------------------------------
  **Mã**           **Yêu cầu**     **Mô tả**                          **Ưu tiên**
  ---------------- --------------- ---------------------------------- ------------
  **FR-DASH-01**   **Tổng quan     Hiển thị số liệu tổng quan: số đơn **Cao**
                   KPI**           hàng, tỉ lệ giao thành công, tổng  
                                   tồn kho, số tuyến đang chạy.       

  **FR-DASH-02**   **Bản đồ        Tích hợp bản đồ hiển thị vị trí    **Cao**
                   real-time**     tài xế và tuyến đường.             

  **FR-DASH-03**   **Biểu đồ dự    Hiển thị biểu đồ dự báo nhu cầu    **Trung
                   báo**           theo sản phẩm.                     bình**

  **FR-DASH-04**   **Cảnh báo hệ   Hiển thị danh sách cảnh báo: tồn   **Trung
                   thống**         kho thấp, giao hàng trễ, sai lệch  bình**
                                   dự báo lớn.                        
  --------------------------------------------------------------------------------

5\. Yêu cầu phi chức năng

5.1 Hiệu năng

-   Thời gian phản hồi API CRUD cơ bản dưới 500ms trong điều kiện tải
    bình thường.

-   Thời gian tính toán tối ưu tuyến cho ≤ 50 điểm giao nên hoàn thành
    trong vài giây (mục tiêu tham khảo, cần đo thực tế theo thuật toán
    chọn).

-   Cập nhật vị trí tài xế qua WebSocket có độ trễ hiển thị trên
    dashboard ở mức vài giây.

5.2 Bảo mật

-   Mật khẩu người dùng được băm bằng bcrypt hoặc argon2, không lưu dạng
    plaintext.

-   Toàn bộ API xác thực bằng JWT; refresh token có cơ chế thu hồi.

-   Áp dụng RBAC ở tầng guard/middleware cho mọi endpoint nhạy cảm.

-   Giao tiếp giữa client--server và giữa hai service nội bộ nên qua
    HTTPS khi triển khai thực tế.

5.3 Độ tin cậy & khả dụng

-   Xử lý lỗi khi Python ML service không phản hồi (timeout, retry); có
    phương án fallback về thuật toán nội bộ đơn giản cho route
    optimization nếu OR-Tools service gián đoạn.

-   Ghi log đầy đủ cho các thao tác quan trọng (tạo đơn, chạy tối ưu,
    chạy forecast) phục vụ debug và audit.

5.4 Khả năng mở rộng

-   Kiến trúc tách service cho phép scale riêng phần ML (thường tốn tài
    nguyên tính toán hơn) độc lập với phần API nghiệp vụ.

-   Schema dữ liệu hỗ trợ thêm kho, xe, tài xế mới mà không cần thay đổi
    cấu trúc bảng.

5.5 Khả năng bảo trì

-   Tổ chức code theo module NestJS rõ ràng, tách biệt theo domain ---
    đã có kinh nghiệm từ dự án trước.

-   Có tài liệu API: Swagger/OpenAPI cho NestJS, tài liệu tự động (docs)
    cho FastAPI --- dễ tích hợp và bảo trì.

5.6 Khả năng sử dụng

-   Dashboard trực quan, ưu tiên hiển thị thông tin quan trọng (cảnh
    báo, KPI) ở vị trí dễ thấy.

-   Giao diện tài xế đơn giản, tối thiểu thao tác --- phù hợp dùng khi
    đang di chuyển.

6\. Thiết kế dữ liệu

6.1 Mô hình dữ liệu tổng quan

Cơ sở dữ liệu được tổ chức thành bốn nhóm bảng chính, phản ánh đúng
luồng nghiệp vụ ở Mục 2.3:

-   Nhóm người dùng: users.

-   Nhóm nghiệp vụ lõi: products, warehouses, stock_movements.

-   Nhóm đơn hàng & giao vận: orders, order_items, delivery_points,
    drivers, vehicles, routes, route_stops.

-   Nhóm dự báo: forecasts.

stock_movements là nguồn dữ liệu chính nuôi Forecast Module; forecasts
lưu song song predicted_quantity và actual_quantity để tính chỉ số sai
số (MAE/RMSE/MAPE) làm minh chứng độ chính xác mô hình.

Toàn bộ cấu trúc cơ sở dữ liệu được định nghĩa và quản lý thông qua **Prisma Schema** (`prisma/schema.prisma`), hỗ trợ version control cho database migrations và tự động sinh Prisma Client type-safe cho các service trong NestJS.

6.2 Từ điển dữ liệu (Data Dictionary)

**users**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh người dùng

  email             VARCHAR       Email đăng nhập, unique

  password_hash     VARCHAR       Mật khẩu đã băm

  full_name         VARCHAR       Họ tên

  role              ENUM          admin / warehouse_manager / dispatcher /
                                  driver

  created_at        TIMESTAMP     Thời điểm tạo
  ------------------------------------------------------------------------

**products**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh sản phẩm

  sku               VARCHAR       Mã sản phẩm, unique

  name              VARCHAR       Tên sản phẩm

  category          VARCHAR       Danh mục

  unit              VARCHAR       Đơn vị tính (cái, thùng\...)

  price             DECIMAL       Đơn giá

  created_at        TIMESTAMP     Thời điểm tạo
  ------------------------------------------------------------------------

**warehouses**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh kho

  name              VARCHAR       Tên kho

  address           VARCHAR       Địa chỉ

  latitude          DECIMAL       Vĩ độ

  longitude         DECIMAL       Kinh độ
  ------------------------------------------------------------------------

**stock_movements**

  ---------------------------------------------------------------------------
  **Trường**           **Kiểu dữ     **Mô tả**
                       liệu**        
  -------------------- ------------- ----------------------------------------
  id                   UUID (PK)     Định danh phiếu

  product_id           UUID (FK)     Tham chiếu products

  warehouse_id         UUID (FK)     Tham chiếu warehouses

  type                 ENUM          in (nhập) / out (xuất)

  quantity             INT           Số lượng

  reference_order_id   UUID (FK),    Liên kết đơn hàng nếu xuất kho do bán
                       nullable      

  created_at           TIMESTAMP     Thời điểm ghi nhận --- dữ liệu nền cho
                                     forecast
  ---------------------------------------------------------------------------

**orders**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh đơn hàng

  status            ENUM          pending / confirmed / shipping /
                                  delivered / failed / cancelled

  created_by        UUID (FK)     Người tạo đơn

  created_at        TIMESTAMP     Thời điểm tạo
  ------------------------------------------------------------------------

**order_items**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh dòng đơn hàng

  order_id          UUID (FK)     Tham chiếu orders

  product_id        UUID (FK)     Tham chiếu products

  quantity          INT           Số lượng đặt

  unit_price        DECIMAL       Đơn giá tại thời điểm đặt
  ------------------------------------------------------------------------

**delivery_points**

  --------------------------------------------------------------------------
  **Trường**          **Kiểu dữ     **Mô tả**
                      liệu**        
  ------------------- ------------- ----------------------------------------
  id                  UUID (PK)     Định danh điểm giao

  order_id            UUID (FK)     Tham chiếu orders

  address             VARCHAR       Địa chỉ giao hàng

  latitude            DECIMAL       Vĩ độ

  longitude           DECIMAL       Kinh độ

  time_window_start   TIME,         Khung giờ giao sớm nhất
                      nullable      

  time_window_end     TIME,         Khung giờ giao muộn nhất
                      nullable      
  --------------------------------------------------------------------------

**drivers**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh tài xế

  user_id           UUID (FK)     Tham chiếu users

  phone             VARCHAR       Số điện thoại

  status            ENUM          available / on_route / off_duty
  ------------------------------------------------------------------------

**vehicles**

  ------------------------------------------------------------------------
  **Trường**        **Kiểu dữ     **Mô tả**
                    liệu**        
  ----------------- ------------- ----------------------------------------
  id                UUID (PK)     Định danh phương tiện

  plate_number      VARCHAR       Biển số

  capacity          DECIMAL       Tải trọng / sức chứa

  type              VARCHAR       Loại xe (máy, tải nhỏ\...)
  ------------------------------------------------------------------------

**routes**

  ---------------------------------------------------------------------------
  **Trường**           **Kiểu dữ     **Mô tả**
                       liệu**        
  -------------------- ------------- ----------------------------------------
  id                   UUID (PK)     Định danh tuyến

  route_date           DATE          Ngày giao

  driver_id            UUID (FK)     Tài xế được gán

  vehicle_id           UUID (FK)     Xe được gán

  status               ENUM          planned / in_progress / completed

  total_distance_km    DECIMAL       Tổng quãng đường (kết quả tối ưu)

  total_duration_min   DECIMAL       Tổng thời gian ước tính
  ---------------------------------------------------------------------------

**route_stops**

  --------------------------------------------------------------------------
  **Trường**          **Kiểu dữ     **Mô tả**
                      liệu**        
  ------------------- ------------- ----------------------------------------
  id                  UUID (PK)     Định danh điểm dừng

  route_id            UUID (FK)     Tham chiếu routes

  delivery_point_id   UUID (FK)     Tham chiếu delivery_points

  sequence            INT           Thứ tự dừng trong tuyến (kết quả tối ưu)

  eta                 TIMESTAMP     Thời gian đến dự kiến

  status              ENUM          pending / arrived / completed / failed
  --------------------------------------------------------------------------

**forecasts**

  ---------------------------------------------------------------------------
  **Trường**           **Kiểu dữ     **Mô tả**
                       liệu**        
  -------------------- ------------- ----------------------------------------
  id                   UUID (PK)     Định danh bản ghi dự báo

  product_id           UUID (FK)     Tham chiếu products

  warehouse_id         UUID (FK),    Tham chiếu warehouses (nếu dự báo theo
                       nullable      từng kho)

  forecast_date        DATE          Ngày được dự báo

  predicted_quantity   DECIMAL       Số lượng dự đoán

  actual_quantity      DECIMAL,      Số lượng thực tế --- điền sau, dùng tính
                       nullable      MAE/RMSE/MAPE

  model_used           VARCHAR       Tên mô hình (prophet / arima)

  created_at           TIMESTAMP     Thời điểm chạy dự báo
  ---------------------------------------------------------------------------

7\. Yêu cầu giao diện ngoài

7.1 Giao diện người dùng

-   Web Dashboard: bố cục sidebar + nội dung chính, có bản đồ nhúng,
    biểu đồ dự báo, bảng dữ liệu vận hành.

-   Giao diện tài xế: web responsive tối giản, ưu tiên nút bấm lớn, hiển
    thị tuyến hiện tại và nút cập nhật trạng thái.

7.2 Giao diện phần mềm --- API tham khảo giữa NestJS và FastAPI

  ----------------------------------------------------------------------------
  **Method**   **Endpoint**            **Mô tả**
  ------------ ----------------------- ---------------------------------------
  **POST**     /auth/login             Đăng nhập, trả về JWT access token +
                                       refresh token

  **POST**     /auth/refresh           Làm mới access token

  **GET /      /products               Danh sách sản phẩm / tạo sản phẩm mới
  POST**                               

  **GET**      /warehouses/:id/stock   Xem tồn kho theo kho

  **POST**     /orders                 Tạo đơn hàng mới

  **POST**     /routes/optimize        NestJS nhận yêu cầu tối ưu, gọi nội bộ
                                       sang FastAPI

  **GET**      /routes/:id             Xem chi tiết tuyến đã tối ưu

  **POST**     /forecast/run           NestJS kích hoạt chạy dự báo, gọi nội
                                       bộ sang FastAPI

  **GET**      /forecast/:productId    Xem lịch sử dự báo theo sản phẩm

  **POST (nội  FastAPI: /predict       Nhận dữ liệu lịch sử, trả JSON kết quả
  bộ)**                                dự đoán

  **POST (nội  FastAPI:                Nhận danh sách điểm + toạ độ, trả thứ
  bộ)**        /optimize-route         tự tối ưu
  ----------------------------------------------------------------------------

7.3 Giao diện truyền thông --- WebSocket

-   Namespace /tracking: tài xế emit sự kiện driver:location theo chu kỳ
    (ví dụ mỗi 5--10 giây); dashboard subscribe để cập nhật bản đồ
    real-time.

-   Sự kiện delivery:status-update: tài xế cập nhật trạng thái điểm
    giao; dashboard nhận và cập nhật danh sách tương ứng.

8\. Kế hoạch triển khai

Timeline dự kiến cho đồ án khoảng 3--4 tháng (13+ tuần):

  -----------------------------------------------------------------------
  **Giai đoạn** **Nội dung công việc**            **Đầu ra**
  ------------- --------------------------------- -----------------------
  Tuần 1 -- 3   Setup core: AuthModule,           API CRUD cơ bản hoạt
                ProductModule, WarehouseModule,   động, có xác thực và
                OrderModule --- tái dùng pattern  phân quyền
                JWT/RBAC từ dự án Jira clone      
                trước đó.                         

  Tuần 4 -- 6   Route Optimization: bắt đầu với   RouteModule trả về
                Nearest Neighbor + 2-opt (JS      tuyến tối ưu cho 1 xe,
                thuần) cho bài toán TSP đơn xe;   nhiều điểm giao
                nâng cấp OR-Tools nếu còn thời    
                gian.                             

  Tuần 7 -- 9   Forecast Service                  ForecastModule tích hợp
                (Python/FastAPI + Prophet) --- có FastAPI, trả kết quả dự
                thể làm song song với Route       đoán theo sản phẩm
                Optimization.                     

  Tuần 10 -- 12 Real-time Tracking (WebSocket +   Theo dõi tài xế
                bản đồ) và Dashboard tổng hợp.    real-time; dashboard
                                                  hiển thị KPI, bản đồ,
                                                  biểu đồ dự báo

  Tuần 13+      Hoàn thiện sản phẩm, viết báo     Sản phẩm hoàn chỉnh kèm
                cáo, chuẩn bị bảo vệ trước hội    tài liệu báo cáo đồ án
                đồng.                             
  -----------------------------------------------------------------------

9\. Rủi ro và biện pháp giảm thiểu

  -----------------------------------------------------------------------
  **Rủi ro**         **Mức độ** **Biện pháp giảm thiểu**
  ------------------ ---------- -----------------------------------------
  Cố làm VRP đầy đủ  **Cao**    Bắt đầu với TSP đơn giản (1 xe, nhiều
  (nhiều xe, nhiều              điểm); chỉ mở rộng sang VRP nếu còn thời
  ràng buộc) ngay từ            gian.
  đầu, không kịp                
  tiến độ                       

  Python/FastAPI là  **Trung    Học và làm quen FastAPI ngay từ đầu (song
  công nghệ mới,     bình**     song tuần 1--3), không để dồn cuối kỳ.
  chưa có kinh                  
  nghiệm                        

  Thiếu dữ liệu lịch **Cao**    Viết seed script sinh dữ liệu giả lập (ít
  sử bán hàng đủ lớn            nhất vài tháng dữ liệu) ngay từ đầu dự
  để forecast có ý              án.
  nghĩa                         

  Độ trễ/lỗi khi hai **Trung    Thiết kế cơ chế timeout/retry; có phương
  service giao tiếp  bình**     án fallback cho route optimization.
  qua REST (network,            
  timeout)                      

  Chất lượng         **Trung    Chuẩn hoá dữ liệu địa chỉ đầu vào;
  geocode/toạ độ     bình**     validate lat/lng khi nhập liệu.
  điểm giao không               
  chính xác, ảnh                
  hưởng tối ưu tuyến            

  Mô hình forecast   **Trung    Lưu song song predicted_quantity và
  dự đoán sai lệch   bình**     actual_quantity để tính MAE/RMSE/MAPE
  lớn, khó giải                 minh chứng bằng số liệu cụ thể.
  trình trước hội               
  đồng                          
  -----------------------------------------------------------------------

10\. Phạm vi MVP và hướng mở rộng

10.1 MVP (bắt buộc phải có)

-   Auth + RBAC cơ bản.

-   CRUD Product, Warehouse, Order.

-   Route Optimization: TSP đơn xe (Nearest Neighbor + 2-opt).

-   Forecast: 1 mô hình (Prophet hoặc ARIMA) cho ít nhất 1 nhóm sản
    phẩm.

-   Dashboard: bản đồ tài xế real-time cơ bản + biểu đồ dự báo đơn giản.

10.2 Mở rộng nếu còn thời gian

-   VRP đa xe, đa ràng buộc (tải trọng, khung giờ) bằng OR-Tools.

-   So sánh nhiều mô hình forecast (Prophet vs ARIMA vs mô hình khác).

-   Re-routing động khi có thay đổi giữa chừng (đơn mới phát sinh, tài
    xế báo sự cố).

-   Mobile app cho tài xế (thay vì web responsive).

-   Message queue cho tác vụ forecast/tối ưu chạy nền.

10.3 Ngoài phạm vi (Out of scope)

-   Tích hợp thanh toán.

-   Tích hợp phần cứng GPS chuyên dụng (dùng GPS điện thoại là đủ cho đồ
    án).

-   Đa doanh nghiệp / multi-tenant.

-   Tối ưu chi phí nhiên liệu / bảo trì xe.

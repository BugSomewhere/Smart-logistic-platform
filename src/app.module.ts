import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from '#/app.controller.js';
import { AppService } from '#/app.service.js';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from '#/modules/auth/auth.module.js';
import { PrismaModule } from '#/modules/prisma/prisma.module.js';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from '#/modules/auth/guards/access-token.guard.js';
import { RolesGuard } from './modules/auth/guards/roles.guard.js';
import { UserModule } from './modules/user/user.module.js';
import { CategoryModule } from './modules/category/category.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { WarehouseModule } from './modules/warehouse/warehouse.module.js';
import { OrderModule } from './modules/order/order.module.js';
import { RouteModule } from './modules/route/route.module.js';
import { VehicleModule } from './modules/vehicle/vehicle.module.js';
import { DriverModule } from './modules/driver/driver.module.js';
import { ForecastModule } from './modules/forecast/forecast.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        appKey: config.getOrThrow<string>("OBSERVE_APP_KEY"),
        appSecret: config.getOrThrow<string>("OBSERVE_APP_SECRET"),
        serviceId: 'smart-logistics'
      })
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    DriverModule,
    VehicleModule,
    CategoryModule,
    ProductModule,
    WarehouseModule,
    OrderModule,
    RouteModule,
    ForecastModule
  ],
  controllers: [AppController],
  providers: [AppService]
    // { provide: APP_GUARD, useClass: AccessTokenGuard },
    // { provide: APP_GUARD, useClass: RolesGuard },
})
export class AppModule { }

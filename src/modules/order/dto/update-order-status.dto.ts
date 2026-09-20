import { OrderStatus } from "#/generated/prisma/enums.js";
import { IsEnum } from "class-validator";

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus
}
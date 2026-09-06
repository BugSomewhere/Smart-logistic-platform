import { OrderStatus } from "#/generated/prisma/enums.js";
import { IsDateString, IsEnum, IsOptional } from "class-validator";

export class QueryOrderDto {
  @IsOptional() @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional() @IsDateString()
  planned_date?: string;    // lọc theo ngày giao (FR-ORD-04)
}

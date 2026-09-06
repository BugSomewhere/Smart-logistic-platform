import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class QueryStockHistoryDto {
  @IsOptional() @IsUUID()
  product_id?: string;

  @IsOptional() @IsUUID()
  warehouse_id?: string;

  @IsOptional() @IsDateString()
  from?: string;            // ISO date

  @IsOptional() @IsDateString()
  to?: string;
}

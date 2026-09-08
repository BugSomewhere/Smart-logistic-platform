import { IsUUID, IsOptional, IsInt, Min } from "class-validator";

export class RunForecastDto {
  @IsUUID()
  product_id: string;

  @IsOptional() @IsUUID()
  warehouse_id?: string;

  @IsOptional() @IsInt() @Min(1)
  periods?: number;          // default 30
}

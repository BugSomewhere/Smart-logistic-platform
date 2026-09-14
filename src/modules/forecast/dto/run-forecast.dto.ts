import { IsUUID, IsOptional, IsInt, Min, IsString, IsIn } from "class-validator";

export class RunForecastDto {
  @IsUUID()
  product_id: string;

  @IsOptional() @IsUUID()
  warehouse_id?: string;

  @IsOptional() @IsInt() @Min(1)
  periods?: number;          // default 30

  @IsOptional() @IsString() @IsIn(['prophet', 'arima'])
  model_type?: string  // default prophet
}

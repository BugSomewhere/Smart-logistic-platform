import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";

class CreateOrderItemDto {
   @IsUUID()
   product_id: string

   @IsInt()
   @Min(1)
   quantity: number
}

class CreateDeliveryPointDto {
   @IsString() @IsNotEmpty()
   address: string

   @IsNumber({ maxDecimalPlaces: 7 })
   latitude: number;

   @IsNumber({ maxDecimalPlaces: 7 })
   longitude: number;

   @IsOptional() @IsString()
   time_window_start?: string;    // "HH:mm"

   @IsOptional() @IsString()
   time_window_end?: string;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  warehouse_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDeliveryPointDto)
  delivery_points: CreateDeliveryPointDto[];

  @IsOptional() @IsDateString()
  planned_date?: string;         // FR-ORD-04: ngày dự kiến giao
}



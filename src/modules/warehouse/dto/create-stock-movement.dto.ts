import { MovementType } from '#/generated/prisma/enums.js';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateStockMovementDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  warehouse_id: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsInt() @Min(1)
  quantity: number;

  @IsOptional() @IsUUID()
  reference_order_id?: string;
}

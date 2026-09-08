import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateVehicleDto {
  @IsString() @IsNotEmpty()
  plate_number: string;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0)
  capacity: number;

  @IsString() @IsNotEmpty()
  type: string;        // "xe máy", "tải nhỏ", "tải lớn"
}

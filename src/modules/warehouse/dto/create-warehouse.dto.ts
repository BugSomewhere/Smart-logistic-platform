import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWarehouseDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  address: string;

  @IsNumber({ maxDecimalPlaces: 7 })
  latitude: number;

  @IsNumber({ maxDecimalPlaces: 7 })
  longitude: number;
}

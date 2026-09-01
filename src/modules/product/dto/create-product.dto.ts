import { IsString, IsNotEmpty, IsUUID, Min, IsNumber } from "class-validator";

export class CreateProductDto {
   @IsString() @IsNotEmpty()
   name: string

   @IsString() @IsNotEmpty()
   sku: string

   @IsString() @IsNotEmpty()
   unit: string

   @IsNumber({maxDecimalPlaces:2}) @Min(0)
   price: number
   @IsUUID()
   category_id: string;
}

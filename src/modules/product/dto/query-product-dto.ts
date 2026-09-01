import { IsOptional, IsString } from "class-validator";

export class QueryProductDto {
   @IsOptional() @IsString()
   search?: string;
   @IsOptional() @IsString()
   category?: string;


   @IsOptional() @IsString()
   category_id?: string;
}
import { IsOptional, IsString, IsUUID } from "class-validator";

export class QueryProductDto {
   @IsOptional() @IsString()
   search?: string;
   
   @IsOptional() @IsUUID()
   category_id?: string;
}
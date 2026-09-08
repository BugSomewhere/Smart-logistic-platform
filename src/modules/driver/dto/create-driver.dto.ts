import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateDriverDto {
  @IsUUID()
  user_id: string;      // phải là user có role = driver

  @IsString() @IsNotEmpty()
  phone: string;
}

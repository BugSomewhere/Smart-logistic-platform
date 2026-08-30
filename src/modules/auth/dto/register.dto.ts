import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto{
   @IsEmail()
   email: string;

   @IsString()
   @MinLength(6)
   password: string;

   @IsString()
   @IsNotEmpty()
   full_name: string;

    // Không có role field — mặc định driver (Prisma schema default)
}

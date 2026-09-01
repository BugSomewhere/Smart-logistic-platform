import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '#/modules/prisma/prisma.service.js';
import { UpdateProfileDto } from '#/modules/user/dto/update-profile.dto.js';
import { ChangePasswordDto } from '#/modules/user/dto/change-password.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService){}

  async getProfile(userId: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select:{
        id:true,
        full_name:true,
        email:true,
        role:true,
        created_at:true
      }
    })
  }

  async updateProfile(userId: string, dto: UpdateProfileDto){
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id:true,
        full_name:true,
        email:true,
        role:true,
        created_at:true
      }
    })
  }

  async changePassword(userId: string, dto: ChangePasswordDto){
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })
    if(!user) throw new NotFoundException("User not found")
    const matchPassword = await bcrypt.compare(dto.current_password, user.password_hash);

    if(!matchPassword) throw new BadRequestException("Wrong current password")
    
    if(dto.new_password === dto.current_password) throw new BadRequestException("New password must be different from current password")
    const newPasswordHash = await bcrypt.hash(dto.new_password, 10)

    return this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
      omit: {
        password_hash:true,
        refresh_token:true
      }
    })
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './createuser.dto';
import { UpdateuserDto } from './updateuser.dto';
import { DeleteUserDto } from './deleteuser.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async updateUser(data: UpdateuserDto) {
    return this.prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
      },
    });
  }

  async deleteUser(data: DeleteUserDto) {
    return this.prisma.user.delete({
      where: { name: data.name, email: data.email },
    });
  }
}

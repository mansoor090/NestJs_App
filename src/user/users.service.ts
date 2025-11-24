import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/createuser.dto';
import { UpdateuserDto } from './dto/updateuser.dto';
import { DeleteUserDto } from './dto/deleteuser.dto';
import { hashPassword } from '../Utils/hash.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    // Prevent admin creation via API - admins should only be created via seeder
    if (data.role === 'ADMIN') {
      throw new HttpException(
        'Admin users cannot be created through the API. Use database seeder instead.',
        HttpStatus.FORBIDDEN,
      );
    }

    const hashedPassword = await hashPassword(data.password);

    try {
      return await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || 'RESIDENT',
        },
      });
    } catch (error) {
      // Check for Prisma unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // e.g., conflict on email field
        throw new ConflictException(`Email ${data.email} already exists.`);
      }

      // Other errors
      throw error;
    }

    // return this.prisma.user.create({
    //   data: {
    //     name: data.name,
    //     email: data.email,
    //     password: hashedPassword, // Map to 'password' field in DB

    //     role: data.role || 'RESIDENT',
    //   },
    // });
  }

  async updateUser(data: UpdateuserDto) {
    return this.prisma.user.update({
      where: { email: data.originalEmail },
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async deleteUser(data: DeleteUserDto) {
    return this.prisma.user.delete({
      where: { email: data.email },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

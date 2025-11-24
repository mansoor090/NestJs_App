import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/createuser.dto';
import { UpdateuserDto } from './dto/updateuser.dto';
import { DeleteUserDto } from './dto/deleteuser.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('all')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAll() {
    return this.userService.getAllUsers();
  }

  @Post('create')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Put('update')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Body() dto: UpdateuserDto) {
    return this.userService.updateUser(dto);
  }

  @Delete('delete')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Body() dto: DeleteUserDto) {
    return this.userService.deleteUser(dto);
  }
}

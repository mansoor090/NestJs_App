import { Body, Controller, Delete, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './createuser.dto';
import { UpdateuserDto } from './updateuser.dto';
import { DeleteUserDto } from './deleteuser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Put('update')
  async update(@Body() dto: UpdateuserDto) {
    return this.userService.updateUser(dto);
  }

  @Delete('delete')
  async delete(@Body() dto: DeleteUserDto) {
    return this.userService.deleteUser(dto);
  }
}

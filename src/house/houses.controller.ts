import { Body, Controller, Delete, Get, Post, Put, UseGuards, Req } from '@nestjs/common';
import { HousesService } from './houses.service';
import { CreateHouseDto } from './dto/createhouse.dto';
import { UpdateHouseDto } from './dto/updatehouse.dto';
import { DeleteHouseDto } from './dto/deletehouse.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

@Controller('admin/houses')
export class HousesController {
  constructor(private housesService: HousesService) {}

  @Get('all')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAll() {
    return this.housesService.getAllHouses();
  }

  @Post('create')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateHouseDto) {
    return this.housesService.createHouse(dto);
  }

  @Put('update')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Body() dto: UpdateHouseDto) {
    return this.housesService.updateHouse(dto);
  }

  @Delete('delete')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Body() dto: DeleteHouseDto) {
    return this.housesService.deleteHouse(dto);
  }
}

@Controller('user/houses')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.RESIDENT)
export class UserHousesController {
  constructor(private housesService: HousesService) {}

  @Get()
  async getUserHouses(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.housesService.getUserHouses(userId);
  }
}


import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHouseDto } from './dto/createhouse.dto';
import { UpdateHouseDto } from './dto/updatehouse.dto';
import { DeleteHouseDto } from './dto/deletehouse.dto';

@Injectable()
export class HousesService {
  constructor(private prisma: PrismaService) {}

  async createHouse(data: CreateHouseDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if house with same number already exists for this user
    const existingHouse = await this.prisma.house.findFirst({
      where: {
        houseNo: data.houseNo,
        userId: data.userId,
      },
    });

    if (existingHouse) {
      throw new HttpException(
        'House with this number already exists for this user',
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.house.create({
      data: {
        houseNo: data.houseNo,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateHouse(data: UpdateHouseDto) {
    // Check if house exists
    const house = await this.prisma.house.findUnique({
      where: { id: data.id },
    });

    if (!house) {
      throw new HttpException('House not found', HttpStatus.NOT_FOUND);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if another house with same number exists for this user
    const existingHouse = await this.prisma.house.findFirst({
      where: {
        houseNo: data.houseNo,
        userId: data.userId,
        id: { not: data.id },
      },
    });

    if (existingHouse) {
      throw new HttpException(
        'House with this number already exists for this user',
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.house.update({
      where: { id: data.id },
      data: {
        houseNo: data.houseNo,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteHouse(data: DeleteHouseDto) {
    // Check if house exists
    const house = await this.prisma.house.findUnique({
      where: { id: data.id },
      include: {
        invoices: true,
      },
    });

    if (!house) {
      throw new HttpException('House not found', HttpStatus.NOT_FOUND);
    }

    // Check if house has invoices (optional: you might want to prevent deletion if invoices exist)
    if (house.invoices && house.invoices.length > 0) {
      throw new HttpException(
        'Cannot delete house with existing invoices',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.house.delete({
      where: { id: data.id },
    });
  }

  async getAllHouses() {
    return this.prisma.house.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserHouses(userId: string) {
    return this.prisma.house.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}


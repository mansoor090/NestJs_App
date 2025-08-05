import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDto } from './dto/authPayloadDto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser({ email, password }: AuthPayloadDto) {
    const findUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isValidPassword = await bcrypt.compare(
      password,
      findUser.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, ...user } = findUser;
    try {
      const jwt = this.jwtService.sign(user);
      return { ...user, jwt };
    } catch (e) {
      console.error(e);
      throw new HttpException(
        'Something went wrong at JWT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

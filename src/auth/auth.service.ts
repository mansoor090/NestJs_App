import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dto/authPayloadDto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { comparePassword } from 'src/Utils/hash.util';

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

    const isValidPassword = await comparePassword(password, findUser.password);
    if (!isValidPassword) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
      // throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...user } = findUser;
    try {
      const jwt = this.jwtService.sign(user);
      return { ...user, jwt };
    } catch (e) {
      console.error(e);
      throw new HttpException('Something went wrong at JWT', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

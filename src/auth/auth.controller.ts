import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard/jwt.guard';
import { Request } from 'express';
import { AuthPayloadDto } from './dto/authPayloadDto';
import { LocalGuard } from './guard/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: Request) {
    return req.user;
  }

  // @Post('login')
  // login(@Body() payload: AuthPayloadDto) {
  //   return this.authService.validateUser(payload);
  // }

  @Get('status')
  @UseGuards(JwtGuard)
  status(@Req() req: Request) {
    console.log('Inside AuthController Status Method');
    console.log(req.user);
    return req.user;
  }
}

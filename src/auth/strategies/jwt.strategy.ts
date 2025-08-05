import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import * as process from 'node:process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_Secret as string,
    });
  }

  validate(payload: any) {
    console.log('Inside JWT Strategy');
    console.log(payload);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return payload;
  }
}

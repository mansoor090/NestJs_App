import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  validate(email: string, password: string) {
    console.log('Step 2 - Inside LocalStrategy');
    const user = this.authService.validateUser({ email, password });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

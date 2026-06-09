import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';

export type JwtPayload = {
  sub: string;
  email?: string;
  role?: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.userService.findById(payload.sub);

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

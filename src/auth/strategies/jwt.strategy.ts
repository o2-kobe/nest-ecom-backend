import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email?: string;
  role?: UserRole;
};

const cookieExtractor = (req: Request): string | null => {
  if (!req?.cookies) {
    return null;
  }

  return req.cookies.access_token as string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.userService.findById(payload.sub);

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

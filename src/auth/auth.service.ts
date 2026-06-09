import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../user/entities/user.entity';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.userService.createUser(dto, UserRole.USER);

    return {
      user,
      message: 'Account created successfully. Please log in to continue',
    };
  }

  async createAdmin(dto: CreateUserDto) {
    const admin = await this.userService.createUser(dto, UserRole.ADMIN);

    return {
      admin,
      message: 'Admin user created successfully',
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userService.findLocalUserByEmail(email);

    const isMatch = await bcrypt.compare(dto.password, user.password!);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findLocalUserByEmail(payload.email!);

    if (!user.refreshToken) throw new UnauthorizedException('Invalid token');

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isMatch) throw new UnauthorizedException('Invalid token');

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_ACCESS_SECRET,
      },
    );
  }

  private generateRefreshToken(user: User) {
    return this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...safeUser } = user;

    return safeUser;
  }
}

import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserService } from '../../user/user.service';

export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENTID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(profile: Profile) {
    const email = profile?.emails?.[0].value;
    const { given_name, family_name } = profile._json;
    const googleId = profile.id;

    if (!email) {
      throw new UnauthorizedException(
        'Google account must have an associated email address',
      );
    }

    const user = await this.userService.findOrCreateOAuthUser({
      email,
      firstName: given_name!,
      lastName: family_name!,
      googleId,
    });

    return user;
  }
}

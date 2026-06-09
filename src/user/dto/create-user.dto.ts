import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'First name must be at least 3 characters' })
  @MaxLength(20, { message: 'First name cannot exceed 25 characters' })
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Last name must be at least 3 characters' })
  @MaxLength(20, { message: 'Last name cannot exceed 25 characters' })
  lastName!: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(64, { message: 'Password cannot exceed 64 characters' })
  password?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  googleId?: string;
}

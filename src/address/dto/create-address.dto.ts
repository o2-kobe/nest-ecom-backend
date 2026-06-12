import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Country name must be at least 3 characters' })
  @MaxLength(20, { message: 'Country name cannot exceed 20 characters' })
  country!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'City name must be at least 2 characters' })
  @MaxLength(50, { message: 'City name cannot exceed 50 characters' })
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Street name must be at least 3 characters' })
  @MaxLength(50, { message: 'Street name cannot exceed 50 characters' })
  street!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Postal code must be at least 3 characters' })
  @MaxLength(50, { message: 'Postal code cannot exceed 50 characters' })
  postalCode!: string;
}

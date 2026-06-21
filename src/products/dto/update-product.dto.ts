import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';

import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

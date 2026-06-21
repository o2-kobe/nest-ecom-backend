import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
  IsUUID,
  MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @IsUUID()
  categoryId!: string;
}

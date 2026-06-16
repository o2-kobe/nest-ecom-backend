import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsUUID()
  categoryId!: string;
}

import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1.0)
  @Max(5.0)
  rating!: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsUUID()
  productId!: string;
}

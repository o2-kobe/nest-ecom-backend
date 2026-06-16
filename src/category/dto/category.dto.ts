import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(3)
  name!: string;
}

import { IsUUID } from 'class-validator';

export class ProductParamsDto {
  @IsUUID('4', { message: 'The provided category ID format is invalid.' })
  categoryId!: string;
}

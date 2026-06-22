import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateInventoryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  lowStockThreshold!: number;
}

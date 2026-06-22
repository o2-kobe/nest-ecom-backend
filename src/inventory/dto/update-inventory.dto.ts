import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lowStockThreshold?: number;
}

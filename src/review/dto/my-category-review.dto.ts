import { CategoryType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class MyCategoryReviewDto {
  @Transform(({ value }: { value: string }) => {
    if (
      value &&
      Object.values(CategoryType).includes(value.toUpperCase() as CategoryType)
    ) {
      return value.toUpperCase();
    }
    return null;
  })
  @IsOptional()
  @IsEnum(CategoryType)
  category?: CategoryType;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  q?: string;
}

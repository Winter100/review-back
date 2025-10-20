import { CategoryType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }: { value: string }) => {
    return value.toUpperCase();
  })
  @IsEnum(CategoryType)
  category: CategoryType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => Number)
  @IsNumber()
  rating: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  price?: string;
}

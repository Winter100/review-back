import { CategoryType, Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class QueryReviewDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: string }) => {
    if (!value) return null;
    let arr: string[];
    if (Array.isArray(value)) {
      arr = value;
    } else {
      arr = value.includes(',') ? value.split(',') : [value];
    }

    const upperCaseValues = arr.map((c: string) =>
      String(c).trim().toUpperCase(),
    );
    const categorySet = new Set<string>(Object.values(CategoryType));
    const queryArr = upperCaseValues.filter((value) => categorySet.has(value));

    return queryArr.length >= 1 ? queryArr : null;
  })
  category?: string[];

  @IsOptional()
  @IsString()
  sort?: Prisma.SortOrder = 'desc';

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit: number = 15;

  @IsOptional()
  @IsString()
  cursor?: string | null;

  @IsOptional()
  @IsString()
  authorId?: string | null;
}

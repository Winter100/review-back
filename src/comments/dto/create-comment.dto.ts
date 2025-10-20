import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId: number;

  @IsString()
  content: string;
}

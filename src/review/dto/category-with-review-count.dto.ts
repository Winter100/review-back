import { ApiProperty } from '@nestjs/swagger';

export class CategoryWithReviewCountDto {
  @ApiProperty({ description: '카테고리 고유 ID' })
  id: number;

  @ApiProperty({ description: '카테고리 이름 (예: URL slug, 식별자)' })
  name: string;

  @ApiProperty({ description: '카테고리 제목 (UI 표시용)' })
  title: string;

  @ApiProperty({ description: '카테고리 설명', required: false })
  description: string;

  @ApiProperty({ description: '해당 카테고리의 총 리뷰 수' })
  count: number;
}

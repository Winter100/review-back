import { IsString } from 'class-validator';

export class DeleteReviewDto {
  @IsString()
  reviewId: string;
}

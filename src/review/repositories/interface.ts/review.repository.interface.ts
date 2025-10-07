import { UpdateReviewDto } from './../../dto/update-review.dto';
import { QueryReviewDto } from './../../dto/query-review.dto';
import { UserPayload } from './../../../auth/types/payload';
import { CreateReviewDto } from 'src/review/dto/create-review.dto';

export interface IReviewRepository {
  create(
    user: UserPayload,
    categoryId: number,
    dto: CreateReviewDto,
  ): Promise<any>;
  findById(id: string): Promise<any>;
  findByCategory(queryReviewDto: QueryReviewDto): Promise<any[]>;
  update(
    reviewId: string,
    categoryId: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<any>;
  delete(id: string): Promise<void>;
}

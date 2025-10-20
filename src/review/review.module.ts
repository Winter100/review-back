import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { ReviewRepository } from './repositories/review.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [SupabaseModule, PrismaModule, CommentsModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService],
})
export class ReviewModule {}

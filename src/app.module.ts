import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ReviewModule } from './review/review.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SupabaseModule,
    ReviewModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

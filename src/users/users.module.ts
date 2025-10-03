import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from 'src/users/repositories/user.repository';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UsersController } from './users.controller';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [PrismaModule, SupabaseModule, ReviewModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}

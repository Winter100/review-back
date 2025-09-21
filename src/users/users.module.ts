import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from 'src/users/repositories/user.repository';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/auth/password.service';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, JwtService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}

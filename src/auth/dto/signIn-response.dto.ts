import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../types/payload';

class UserResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '홍길동' })
  nickname: string;

  @ApiProperty({ example: 'hong@test.com' })
  email: string;

  @ApiProperty({ example: 'string || null' })
  profileImageUrl: string | null;

  @ApiProperty({ example: '자기소개 입니다 || null' })
  introduction: string | null;
}

export class SignInResponseDto {
  @ApiProperty({
    type: UserResponseDto,
  })
  user: User;

  @ApiProperty({
    example: 'xxxxx.yyyyy.zzzzz',
  })
  accessToken: string;
}

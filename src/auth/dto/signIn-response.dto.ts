import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../types/payload';

class UserResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 'hong@test.com' })
  email: string;
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

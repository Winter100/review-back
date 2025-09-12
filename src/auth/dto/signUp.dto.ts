import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'test@example.com',
    description: '사용자 이메일',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'string',
    description: '사용자 비밀번호',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '홍길동',
    description: '사용자 닉네임',
  })
  name: string;
}

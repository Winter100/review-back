import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'test@example.com', description: '사용자 이메일' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'string', description: '비밀번호' })
  password: string;
}

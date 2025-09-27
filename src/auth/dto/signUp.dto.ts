import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto implements Prisma.UserCreateInput {
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
  nickname: string;

  // @IsString()
  // @IsOptional()
  // @ApiProperty({
  //   example: '자기소개',
  //   description: '안녕하세요. 홍길동 입니다.',
  //   required: false,
  // })
  // introduction?: string;
}

// export class SignUpWithFileDto extends SignUpDto {
//   @IsOptional()
//   @ApiProperty({
//     type: 'string',
//     format: 'binary',
//     description: '프로필 이미지',
//     required: false,
//   })
//   profileImage?: Express.Multer.File;
// }

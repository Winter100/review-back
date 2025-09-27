import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export const SIGNUP_SUCCESS = {
  message: '회원가입 성공',
  statusCode: HttpStatus.CREATED,
};

export class SignUpSuccessResponseDto {
  @ApiProperty({
    type: String,
    example: SIGNUP_SUCCESS.message,
  })
  message: string;

  @ApiProperty({
    type: Number,
    example: SIGNUP_SUCCESS.statusCode,
  })
  statusCode: number;
}

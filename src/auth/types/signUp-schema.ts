export const signUpSchema = {
  type: 'object',
  properties: {
    image: {
      type: 'string',
      format: 'binary',
      description: '프로필 이미지 파일',
    },
    email: { type: 'string', example: 'test@example.com' },
    password: { type: 'string', example: 'password123' },
    nickname: { type: 'string', example: '홍길동' },
    introduction: { type: 'string', example: '안녕하세요.' },
  },
};

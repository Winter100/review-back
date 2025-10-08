import { IsUUID, ValidationArguments } from 'class-validator';

export class FindOneParamsDto {
  @IsUUID('all', {
    message: (args: ValidationArguments) => {
      return `${args.value}는 올바른 ID 형식이 아닙니다.`;
    },
  })
  id: string;
}

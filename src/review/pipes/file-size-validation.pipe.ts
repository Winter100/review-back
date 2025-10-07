import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  constructor(private readonly maxSize: number) {}

  transform(value: Express.Multer.File[]) {
    if (!value || value.length === 0) return [];

    const invalidFiles = value.filter((file) => file.size > this.maxSize);

    if (invalidFiles.length > 0) {
      const names = invalidFiles.map((f) => f.originalname).join(', ');
      throw new BadRequestException(
        `다음 파일이 용량 제한 ${this.maxSize / 1024 / 1024}MB를 초과 했습니다: ${names}`,
      );
    }
    return value;
  }
}

import { SupabaseService } from './supabase.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sharp from 'sharp';
import { ProcessedFile } from 'src/review/types/image-type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(file: ProcessedFile, bucket: string) {
    const supabase = this.supabaseService.getClient();

    const fileName = `${uuidv4()}-${file.originalname}`;

    // Todo: 이미지 전처리 과정 추가하기
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(error.message);

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async processMultipleFile(files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) return [];

    const processingPromises = files.map((file) =>
      this.processSingleFile(file),
    );

    try {
      const result = await Promise.all(processingPromises);
      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '하나 이상의 이미지 처리 중 오류가 발생했습니다.',
      );
    }
  }

  private async processSingleFile(
    file: Express.Multer.File,
  ): Promise<ProcessedFile> {
    const precessedBuffer = await sharp(file.buffer)
      .toFormat('webp')
      .webp({ quality: 80 })
      .toBuffer();

    return {
      buffer: precessedBuffer,
      originalname: file.originalname,
      mimetype: 'image/webp',
    };
  }
}

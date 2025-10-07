import path from 'path';
import { SupabaseService } from './supabase.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';
import { ProcessedFile } from 'src/review/types/image-type';
import { v4 as uuidv4 } from 'uuid';
import { UTApi } from 'uploadthing/server';

@Injectable()
export class ImageService {
  private readonly utapi = new UTApi();
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * UploadThing 이미지 삭제 메서드
   */
  async deleteImage(fileKeys: string | string[]) {
    try {
      if (!fileKeys || (Array.isArray(fileKeys) && fileKeys.length === 0)) {
        throw new NotFoundException('삭제할 파일 키가 제공되지 않았습니다.');
      }

      const res = await this.utapi.deleteFiles(fileKeys);

      if (!res.success) {
        // Uploadthing API에서 삭제가 실패한 경우
        throw new InternalServerErrorException(
          'Uploadthing 파일 삭제에 실패했습니다.',
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        // 이미 NestJS 예외로 정의된 경우 그대로 throw
        throw error;
      }
      // 그 외의 Uploadthing API 통신 오류 등
      throw new InternalServerErrorException(
        `파일 삭제 중 오류 발생: ${error}`,
      );
    }
  }

  async uploadFile(file: ProcessedFile, bucket: string) {
    const supabase = this.supabaseService.getClient();

    const fileExtension = path.extname(file.originalname);

    const fileName = `${uuidv4()}${fileExtension}`;

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

  async uploadFiles(
    files: Express.Multer.File[],
    bucket: string,
  ): Promise<string[]> {
    const processedFiles: ProcessedFile[] =
      await this.processMultipleFile(files);

    const uploadPromises = processedFiles.map((file) =>
      this.uploadFile(file, bucket),
    );

    return await Promise.all(uploadPromises);
  }

  async deleteFile(filePaths: string[], bucket: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) throw new InternalServerErrorException();

    return data;
  }

  getFileData(url: string) {
    try {
      const urlObject = new URL(url);
      const pathSegments = urlObject.pathname.split('/');

      const objectIndex = pathSegments.indexOf('object');
      if (objectIndex !== -1 && pathSegments.length > objectIndex + 2) {
        return {
          bucket: pathSegments[objectIndex + 2],
          fileName: pathSegments[pathSegments.length - 1],
        };
      }

      return null;
    } catch (e) {
      console.error('잘못된 URL 형식입니다:', e);
      return null;
    }
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

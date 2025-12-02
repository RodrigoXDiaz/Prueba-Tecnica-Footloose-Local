import { Injectable, Inject, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject('CLOUDINARY') private readonly cloudinaryInstance: typeof cloudinary) {}

  /**
   * Sube imagen a Cloudinary con optimización automática
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'products',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(`Error al subir imagen a Cloudinary: ${error.message}`);
            return reject(error);
          }
          this.logger.log(`Imagen subida exitosamente: ${result.secure_url}`);
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Elimina imagen de Cloudinary por URL
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.extractPublicId(imageUrl);
      
      if (!publicId) {
        this.logger.warn(`No se pudo extraer el public_id de la URL: ${imageUrl}`);
        return;
      }

      await this.cloudinaryInstance.uploader.destroy(publicId);
      this.logger.log(`Imagen eliminada de Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.error(`Error al eliminar imagen de Cloudinary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrae el public_id de URL Cloudinary
   */
  private extractPublicId(imageUrl: string): string | null {
    try {
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex === -1) {
        return null;
      }

      const pathAfterUpload = urlParts.slice(uploadIndex + 1);
      const versionPattern = /^v\d+$/;
      const startIndex = versionPattern.test(pathAfterUpload[0]) ? 1 : 0;

      const pathWithExtension = pathAfterUpload.slice(startIndex).join('/');
      const publicId = pathWithExtension.replace(/\.[^/.]+$/, '');

      return publicId;
    } catch (error) {
      this.logger.error(`Error al extraer public_id: ${error.message}`);
      return null;
    }
  }

  getOptimizedUrl(publicId: string, width?: number, height?: number): string {
    const options: any = {
      fetch_format: 'auto',
      quality: 'auto',
    };

    if (width && height) {
      options.width = width;
      options.height = height;
      options.crop = 'fill';
    }

    return this.cloudinaryInstance.url(publicId, options);
  }
}

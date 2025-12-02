import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    const cloudinaryUrl = configService.get<string>('CLOUDINARY_URL');
    
    if (!cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL no está configurada en las variables de entorno');
    }

    const urlPattern = /cloudinary:\/\/(\d+):([^@]+)@(.+)/;
    const match = cloudinaryUrl.match(urlPattern);

    if (!match) {
      throw new Error('CLOUDINARY_URL tiene un formato inválido');
    }

    const [, apiKey, apiSecret, cloudName] = match;

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    return cloudinary;
  },
  inject: [ConfigService],
};

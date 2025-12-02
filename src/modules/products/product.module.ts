import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './repositories/product.repository';
import { CloudinaryService } from '../../shared/services/cloudinary.service';
import { CloudinaryProvider } from '../../config/cloudinary.config';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, CloudinaryService, CloudinaryProvider],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}

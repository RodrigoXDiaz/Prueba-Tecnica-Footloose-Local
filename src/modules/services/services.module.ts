import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { PdfService } from './pdf.service';
import { NotificationService } from './notification.service';
import { ServicesController } from './services.controller';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [ProductModule],
  controllers: [ServicesController],
  providers: [ExcelService, PdfService, NotificationService],
  exports: [ExcelService, PdfService, NotificationService],
})
export class ServicesModule {}

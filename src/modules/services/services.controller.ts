import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ExcelService } from './excel.service';
import { PdfService } from './pdf.service';
import { FirebaseAuthGuard } from '@shared/guards/firebase-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRole } from '@core/interfaces/auth.interface';

/**
 * Services Controller
 * Handles Excel import/export and PDF generation
 */
@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ServicesController {
  constructor(
    private readonly excelService: ExcelService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('import/excel')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import products from Excel file (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx) with products data',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Products imported successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async importExcel(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const result = await this.excelService.importProducts(file.buffer);
    return result;
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export products to Excel file' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.excelService.exportProducts();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=productos-${Date.now()}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('pdf/product/:id')
  @ApiOperation({ summary: 'Generate PDF for a product' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.pdfService.generateProductPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=producto-${id}.pdf`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Post('pdf/product/:id/upload')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate and upload PDF to Firebase Storage (Admin only)' })
  @ApiResponse({ status: 200, description: 'PDF uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async uploadPdf(@Param('id') id: string) {
    const url = await this.pdfService.generateAndUploadPdf(id);
    return {
      success: true,
      message: 'PDF generado y subido exitosamente',
      url,
    };
  }
}

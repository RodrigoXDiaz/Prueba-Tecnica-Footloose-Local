import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { CreateProductDto } from '@shared/dtos/create-product.dto';
import { ExcelImportResult } from '@core/interfaces/services.interface';
import { ProductService } from '../products/product.service';
import { BusinessException, ValidationException } from '@core/exceptions/business.exception';

/**
 * Servicio de Excel
 * Importación masiva y exportación con estilos profesionales
 */
@Injectable()
export class ExcelService {
  constructor(private readonly productService: ProductService) {}

  /**
   * Importa productos desde Excel
   * Columnas: name, brand, model, color, size, price, stock, imageUrl, description
   */
  async importProducts(fileBuffer: Buffer): Promise<ExcelImportResult> {
    const result: ExcelImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      products: [],
    };

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new BusinessException('El archivo Excel está vacío', 'EMPTY_FILE', 400);
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          const productDto = this.mapRowToProductDto(row, i + 2);
          this.validateProductDto(productDto);
          const product = await this.productService.create(productDto);
          result.products.push(product);
          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Fila ${i + 2}: ${error.message}`);
        }
      }

      return result;
    } catch (error: any) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        'Error al procesar el archivo Excel',
        'EXCEL_PROCESSING_ERROR',
        400,
      );
    }
  }

  /**
   * Exporta productos a Excel con formato profesional y estilos
   */
  async exportProducts(filters?: any): Promise<Buffer> {
    const products = await this.productService.findAll(filters);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos', {
      properties: { tabColor: { argb: 'FF4472C4' } },
    });

    worksheet.columns = [
      { header: '#', key: 'number', width: 6 },
      { header: 'ID', key: 'id', width: 32 },
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Marca', key: 'brand', width: 15 },
      { header: 'Modelo', key: 'model', width: 22 },
      { header: 'Color', key: 'color', width: 12 },
      { header: 'Talla', key: 'size', width: 10 },
      { header: 'Precio', key: 'price', width: 12 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'URL Imagen', key: 'imageUrl', width: 50 },
      { header: 'Descripción', key: 'description', width: 35 },
      { header: 'Activo', key: 'isActive', width: 10 },
      { header: 'Fecha Creación', key: 'createdAt', width: 16 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.border = {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    };

    products.forEach((product, index) => {
      const row = worksheet.addRow({
        number: index + 1,
        id: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        color: product.color,
        size: product.size,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || '',
        description: product.description || '',
        isActive: product.isActive ? 'Sí' : 'No',
        createdAt: new Date(product.createdAt).toLocaleDateString('es-ES'),
      });

      row.height = 20;

      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: index % 2 === 0 ? 'FFF2F2F2' : 'FFFFFFFF' },
      };

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        };
        cell.alignment = { vertical: 'middle' };
      });

      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center' };

      row.getCell(8).value = product.price;
      row.getCell(8).numFmt = '"S/ "#,##0.00';
      row.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' };

      row.getCell(10).alignment = { vertical: 'middle', wrapText: true };
      row.getCell(11).alignment = { vertical: 'middle', wrapText: true };

      const activeCell = row.getCell(12);
      activeCell.alignment = { vertical: 'middle', horizontal: 'center' };
      activeCell.font = {
        bold: true,
        color: { argb: product.isActive ? 'FF008000' : 'FFFF0000' },
      };
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Mapea filas Excel a DTO (soporta columnas en español e inglés)
   */
  private mapRowToProductDto(row: any, rowNumber: number): CreateProductDto {
    const name = row.Nombre || row.name;
    const brand = row.Marca || row.brand;
    const model = row.Modelo || row.model;
    const color = row.Color || row.color;
    const size = row.Talla || row.size;
    const price = row.Precio || row.price;
    const stock = row.Stock || row.stock;
    const imageUrl = row['URL Imagen'] || row.imageUrl;
    const description = row.Descripción || row.description;

    const missingFields: string[] = [];
    if (!name) missingFields.push('Nombre/name');
    if (!brand) missingFields.push('Marca/brand');
    if (!model) missingFields.push('Modelo/model');
    if (!color) missingFields.push('Color/color');
    if (!size) missingFields.push('Talla/size');
    if (price === undefined || price === null) missingFields.push('Precio/price');
    if (stock === undefined || stock === null) missingFields.push('Stock/stock');

    if (missingFields.length > 0) {
      throw new BusinessException(
        `Campos requeridos faltantes: ${missingFields.join(', ')}`,
        'MISSING_FIELDS',
        400,
      );
    }

    return {
      name: String(name).trim(),
      brand: String(brand).trim(),
      model: String(model).trim(),
      color: String(color).trim(),
      size: String(size).trim(),
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl || undefined,
      description: description || undefined,
      isActive: true,
    };
  }

  /**
   * Validate ProductDto
   */
  private validateProductDto(dto: CreateProductDto): void {
    const errors: Record<string, string[]> = {};

    if (!dto.name || dto.name.trim().length === 0) {
      errors.name = ['El nombre es requerido'];
    }

    if (!dto.brand || dto.brand.trim().length === 0) {
      errors.brand = ['La marca es requerida'];
    }

    if (!dto.model || dto.model.trim().length === 0) {
      errors.model = ['El modelo es requerido'];
    }

    if (!dto.color || dto.color.trim().length === 0) {
      errors.color = ['El color es requerido'];
    }

    if (!dto.size || dto.size.trim().length === 0) {
      errors.size = ['La talla es requerida'];
    }

    if (isNaN(dto.price) || dto.price < 0) {
      errors.price = ['El precio debe ser un número mayor o igual a 0'];
    }

    if (isNaN(dto.stock) || dto.stock < 0) {
      errors.stock = ['El stock debe ser un número mayor o igual a 0'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException('Errores de validación', errors);
    }
  }
}

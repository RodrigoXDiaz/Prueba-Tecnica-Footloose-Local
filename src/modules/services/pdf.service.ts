import { Injectable, Inject } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { ProductService } from '../products/product.service';
import { NotFoundException } from '@core/exceptions/business.exception';
import * as admin from 'firebase-admin';
import axios from 'axios';

/**
 * Servicio de PDF
 * Genera documentos PDF profesionales de productos con diseño corporativo
 */
@Injectable()
export class PdfService {
  constructor(
    private readonly productService: ProductService,
    @Inject('FIREBASE_STORAGE')
    private readonly storage: admin.storage.Storage,
  ) {}

  /**
   * Genera PDF profesional con logo, imagen y tabla de detalles
   */
  async generateProductPdf(productId: string): Promise<Buffer> {
    const product = await this.productService.findOne(productId);

    if (!product) {
      throw new NotFoundException('Product', productId);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 40
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const primaryColor = '#E31E24';
        const secondaryColor = '#2D1B4E';
        const lightGray = '#F5F5F5';
        const darkGray = '#333333';

        doc.rect(0, 0, doc.page.width, 120).fill(secondaryColor);
        doc
          .fontSize(38)
          .font('Helvetica-Bold')
          .fillColor(primaryColor)
          .text('FOOT', 50, 30, { continued: true })
          .fillColor('#FFFFFF')
          .text('LOOSE');

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#FFFFFF')
          .text('Catálogo Profesional de Productos', 50, 75);

        doc
          .fontSize(9)
          .fillColor('#FFFFFF')
          .text(`Fecha: ${new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`, 350, 40, {
            align: 'right',
            width: 195
          });

        doc
          .fontSize(8)
          .fillColor('#CCCCCC')
          .text(`Documento #${productId.substring(0, 8).toUpperCase()}`, 350, 65, {
            align: 'right',
            width: 195
          });

        let imageY = 140;
        
        if (product.imageUrl) {
          try {
            const response = await axios.get(product.imageUrl, { 
              responseType: 'arraybuffer',
              timeout: 5000
            });
            const imageBuffer = Buffer.from(response.data, 'binary');
            
            const imgWidth = 200;
            const imgHeight = 200;
            const imgX = (doc.page.width - imgWidth) / 2;
            
            doc.rect(imgX - 5, imageY - 5, imgWidth + 10, imgHeight + 10)
               .strokeColor(primaryColor)
               .lineWidth(2)
               .stroke();
            
            doc.image(imageBuffer, imgX, imageY, { 
              width: imgWidth,
              height: imgHeight,
              align: 'center'
            });
            
            imageY += imgHeight + 30;
          } catch (error) {
            doc.fontSize(10)
               .fillColor(darkGray)
               .text('Imagen no disponible', 50, imageY, { align: 'center' });
            imageY += 40;
          }
        } else {
          imageY += 20;
        }

        doc
          .fontSize(22)
          .font('Helvetica-Bold')
          .fillColor(secondaryColor)
          .text(product.name, 50, imageY, { align: 'center' });

        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor(darkGray)
          .text(`${product.brand} - ${product.model}`, 50, imageY + 30, { align: 'center' });

        imageY += 70;

        const tableTop = imageY;
        const tableLeft = 50;
        const tableWidth = doc.page.width - 100;
        const rowHeight = 28;
        const colWidth = tableWidth / 2;

        doc.rect(tableLeft, tableTop, tableWidth, 32)
           .fill(primaryColor);

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#FFFFFF')
          .text('INFORMACIÓN DEL PRODUCTO', tableLeft, tableTop + 10, {
            width: tableWidth,
            align: 'center'
          });

        const tableData = [
          ['Código', product.id],
          ['Marca', product.brand],
          ['Modelo', product.model],
          ['Color', product.color],
          ['Talla', product.size],
          ['Precio', `S/ ${product.price.toFixed(2)}`],
          ['Stock Disponible', product.stock.toString()],
          ['Estado', product.isActive ? 'ACTIVO' : 'INACTIVO'],
        ];

        let currentY = tableTop + 32;

        tableData.forEach((row, index) => {
          const [label, value] = row;
          const fillColor = index % 2 === 0 ? lightGray : '#FFFFFF';

          doc.rect(tableLeft, currentY, tableWidth, rowHeight)
             .fill(fillColor);

          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor(secondaryColor)
            .text(label, tableLeft + 15, currentY + 12, {
              width: colWidth - 20,
              align: 'left'
            });

          doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor(darkGray)
            .text(value, tableLeft + colWidth + 10, currentY + 12, {
              width: colWidth - 20,
              align: 'left'
            });

          doc.rect(tableLeft, currentY, colWidth, rowHeight)
             .strokeColor('#DDDDDD')
             .lineWidth(0.5)
             .stroke();

          doc.rect(tableLeft + colWidth, currentY, colWidth, rowHeight)
             .strokeColor('#DDDDDD')
             .lineWidth(0.5)
             .stroke();

          currentY += rowHeight;
        });

        if (product.description) {
          currentY += 15;

          doc.rect(tableLeft, currentY, tableWidth, 25)
             .fill(secondaryColor);

          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF')
            .text('DESCRIPCIÓN', tableLeft + 15, currentY + 7);

          currentY += 25;

          doc.rect(tableLeft, currentY, tableWidth, 50)
             .fill('#FFFFFF')
             .strokeColor('#DDDDDD')
             .lineWidth(0.5)
             .stroke();

          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(darkGray)
            .text(product.description, tableLeft + 12, currentY + 8, {
              width: tableWidth - 24,
              align: 'justify'
            });

          currentY += 55;
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera PDF y lo sube a Firebase Storage con URL pública
   */
  async generateAndUploadPdf(productId: string): Promise<string> {
    const pdfBuffer = await this.generateProductPdf(productId);
    const bucket = this.storage.bucket();
    const fileName = `products/${productId}/ficha-${Date.now()}.pdf`;
    const file = bucket.file(fileName);

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });

    await file.makePublic();
    return file.publicUrl();
  }
}

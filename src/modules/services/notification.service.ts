import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import {
  EmailNotificationPayload,
  PriceChangeNotification,
} from '@core/interfaces/services.interface';

/**
 * Servicio de Notificaciones (Email)
 * Sistema antiguo de notificaciones por email
 */
@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Escucha eventos de cambio de precio
   */
  @OnEvent('product.price-changed')
  async handlePriceChange(payload: PriceChangeNotification) {
    console.log('Precio cambiado:', payload);

    await this.sendPriceChangeEmail(payload);
    await this.sendPriceChangePushNotification(payload);
  }

  private async sendPriceChangeEmail(payload: PriceChangeNotification): Promise<void> {
    const emailBody = this.generatePriceChangeEmailHtml(payload);

    const emailPayload: EmailNotificationPayload = {
      to: this.configService.get<string>('SMTP_USER') || 'admin@example.com',
      subject: `Cambio de Precio: ${payload.productName}`,
      body: `El precio de ${payload.productName} ha cambiado de S/ ${payload.oldPrice} a S/ ${payload.newPrice}`,
      html: emailBody,
    };

    try {
      await this.sendEmail(emailPayload);
      console.log('Email de cambio de precio enviado');
    } catch (error) {
      console.error('Error al enviar email:', error);
    }
  }

  /**
   * Notificación push simulada (no envía realmente)
   */
  private async sendPriceChangePushNotification(
    payload: PriceChangeNotification,
  ): Promise<void> {
    console.log('Push notification simulada:', {
      title: 'Cambio de Precio',
      body: `${payload.productName}: S/ ${payload.oldPrice} → S/ ${payload.newPrice}`,
      data: {
        productId: payload.productId,
        oldPrice: payload.oldPrice,
        newPrice: payload.newPrice,
      },
    });
  }

  /**
   * Send generic email
   */
  async sendEmail(payload: EmailNotificationPayload): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM') || 'noreply@app.com',
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
      html: payload.html || payload.body,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate HTML for price change email
   */
  private generatePriceChangeEmailHtml(payload: PriceChangeNotification): string {
    const priceChange = payload.newPrice - payload.oldPrice;
    const percentageChange = ((priceChange / payload.oldPrice) * 100).toFixed(2);
    const isIncrease = priceChange > 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .price-box { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .old-price { text-decoration: line-through; color: #999; }
          .new-price { font-size: 24px; color: ${isIncrease ? '#f44336' : '#4CAF50'}; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Alerta de Cambio de Precio</h1>
          </div>
          <div class="content">
            <h2>${payload.productName}</h2>
            <p><strong>ID del Producto:</strong> ${payload.productId}</p>
            
            <div class="price-box">
              <p><strong>Precio Anterior:</strong> <span class="old-price">S/ ${payload.oldPrice.toFixed(2)}</span></p>
              <p><strong>Precio Nuevo:</strong> <span class="new-price">S/ ${payload.newPrice.toFixed(2)}</span></p>
              <p><strong>Cambio:</strong> ${isIncrease ? '↑' : '↓'} ${Math.abs(parseFloat(percentageChange))}%</p>
            </div>
            
            <p><strong>Modificado por:</strong> ${payload.changedBy}</p>
            <p><strong>Fecha:</strong> ${payload.changedAt.toLocaleString('es-ES')}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático. Por favor no responda a este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, displayName: string): Promise<void> {
    const emailPayload: EmailNotificationPayload = {
      to: email,
      subject: 'Bienvenido a la plataforma',
      body: `Hola ${displayName}, bienvenido a nuestra plataforma de catálogo de productos.`,
      html: `
        <h1>¡Bienvenido ${displayName}!</h1>
        <p>Gracias por registrarte en nuestra plataforma de catálogo de productos.</p>
        <p>Ya puedes comenzar a explorar nuestro catálogo.</p>
      `,
    };

    try {
      await this.sendEmail(emailPayload);
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
    }
  }
}

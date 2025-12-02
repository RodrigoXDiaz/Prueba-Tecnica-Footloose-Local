import { Product } from './product.interface';

/**
 * Excel import result
 */
export interface ExcelImportResult {
  success: number;
  failed: number;
  errors: string[];
  products: Product[];
}

/**
 * PDF generation options
 */
export interface PdfGenerationOptions {
  productId: string;
  includeImage: boolean;
  includeBarcode?: boolean;
}

/**
 * Email notification payload
 */
export interface EmailNotificationPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

/**
 * Price change notification
 */
export interface PriceChangeNotification {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: Date;
}

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: string;
}

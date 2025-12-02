import { BaseEntity } from './base.interface';

/**
 * Product entity interface - Domain Model
 */
export interface Product extends BaseEntity {
  name: string;
  brand: string;
  model: string;
  color: string;
  size: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock: number;
  isActive: boolean;
}

/**
 * Product filters for search and filter operations
 */
export interface ProductFilters {
  name?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

/**
 * Product repository interface
 */
export interface IProductRepository {
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(filters?: ProductFilters): Promise<Product[]>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  bulkCreate(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Product[]>;
  updatePrice(id: string, newPrice: number): Promise<Product>;
}

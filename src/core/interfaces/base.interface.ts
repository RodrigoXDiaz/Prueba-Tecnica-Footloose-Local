/**
 * Interfaces base del dominio (Clean Architecture)
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRepository<T extends BaseEntity> {
  create(entity: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Partial<T>): Promise<T[]>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Response wrapper for API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

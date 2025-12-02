import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Product, ProductFilters, IProductRepository } from '@core/interfaces/product.interface';
import { NotFoundException } from '@core/exceptions/business.exception';
import { v4 as uuidv4 } from 'uuid';

/**
 * Product Repository Implementation
 * Handles all database operations for products using Firestore
 * Following Repository Pattern
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  private readonly collectionName = 'products';

  constructor(
    @Inject('FIRESTORE')
    private readonly firestore: admin.firestore.Firestore,
  ) {}

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = uuidv4();
    const now = admin.firestore.Timestamp.now();

    const newProduct: Product = {
      ...product,
      id,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      isActive: product.isActive ?? true,
    };

    await this.firestore.collection(this.collectionName).doc(id).set({
      ...newProduct,
      createdAt: now,
      updatedAt: now,
    });

    return newProduct;
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.firestore.collection(this.collectionName).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return this.mapDocToProduct(doc);
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let query: admin.firestore.Query = this.firestore.collection(this.collectionName);

    if (filters) {
      if (filters.brand) {
        query = query.where('brand', '==', filters.brand);
      }
      if (filters.color) {
        query = query.where('color', '==', filters.color);
      }
      if (filters.size) {
        query = query.where('size', '==', filters.size);
      }
      if (filters.isActive !== undefined) {
        query = query.where('isActive', '==', filters.isActive);
      }
      if (filters.minPrice !== undefined) {
        query = query.where('price', '>=', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.where('price', '<=', filters.maxPrice);
      }
    }

    const snapshot = await query.get();
    let products = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => this.mapDocToProduct(doc));

    if (filters?.name) {
      const searchTerm = filters.name.toLowerCase();
      products = products.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm),
      );
    }

    return products;
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const docRef = this.firestore.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Product', id);
    }

    const updateData = {
      ...product,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return this.mapDocToProduct(updatedDoc);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.firestore.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Product', id);
    }

    await docRef.delete();
  }

  async bulkCreate(
    products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<Product[]> {
    const batch = this.firestore.batch();
    const now = admin.firestore.Timestamp.now();
    const createdProducts: Product[] = [];

    for (const product of products) {
      const id = uuidv4();
      const docRef = this.firestore.collection(this.collectionName).doc(id);

      const newProduct: Product = {
        ...product,
        id,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
        isActive: product.isActive ?? true,
      };

      batch.set(docRef, {
        ...newProduct,
        createdAt: now,
        updatedAt: now,
      });

      createdProducts.push(newProduct);
    }

    await batch.commit();
    return createdProducts;
  }

  async updatePrice(id: string, newPrice: number): Promise<Product> {
    return this.update(id, { price: newPrice });
  }

  private mapDocToProduct(doc: admin.firestore.DocumentSnapshot): Product {
    const data = doc.data()!;
    return {
      id: doc.id,
      name: data.name,
      brand: data.brand,
      model: data.model,
      color: data.color,
      size: data.size,
      price: data.price,
      imageUrl: data.imageUrl,
      description: data.description,
      stock: data.stock,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductRepository } from './repositories/product.repository';
import { Product, ProductFilters } from '@core/interfaces/product.interface';
import { CreateProductDto } from '@shared/dtos/create-product.dto';
import { UpdateProductDto } from '@shared/dtos/update-product.dto';
import { NotFoundException } from '@core/exceptions/business.exception';
import { CloudinaryService } from '../../shared/services/cloudinary.service';
import { NotificationService } from '../notifications/notification.service';

/**
 * Servicio de Productos
 * Lógica de negocio: CRUD, subida de imágenes y notificaciones de cambio de precio
 */
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createProductDto: CreateProductDto, imageFile?: Express.Multer.File): Promise<Product> {
    let imageUrl = createProductDto.imageUrl;
    if (imageFile) {
      imageUrl = await this.cloudinaryService.uploadImage(imageFile, 'products');
    }

    const productData = {
      ...createProductDto,
      imageUrl,
      isActive: createProductDto.isActive ?? true,
    };
    
    const product = await this.productRepository.create(productData);
    this.eventEmitter.emit('product.created', product);
    
    return product;
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    return this.productRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundException('Product', id);
    }
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string, imageFile?: Express.Multer.File): Promise<Product> {
    const oldProduct = await this.findOne(id);

    let imageUrl = updateProductDto.imageUrl;
    if (imageFile) {
      imageUrl = await this.cloudinaryService.uploadImage(imageFile, 'products');
      
      if (oldProduct.imageUrl) {
        try {
          await this.cloudinaryService.deleteImage(oldProduct.imageUrl);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    const priceChanged = 'price' in updateProductDto && updateProductDto.price !== undefined && updateProductDto.price !== oldProduct?.price;

    const updatedProduct = await this.productRepository.update(id, { ...updateProductDto, imageUrl });

    if (priceChanged && oldProduct) {
      this.eventEmitter.emit('product.price-changed', {
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        oldPrice: oldProduct.price,
        newPrice: updatedProduct.price!,
        changedBy: userId,
        changedAt: new Date(),
      });

      if (updatedProduct.price! < oldProduct.price) {
        try {
          await this.notificationService.sendPriceDropNotification(
            updatedProduct.id,
            updatedProduct.name,
            oldProduct.price,
            updatedProduct.price!,
            updatedProduct.imageUrl
          );
        } catch (error) {
          console.error('Error al enviar notificación de precio:', error);
        }
      }
    }

    this.eventEmitter.emit('product.updated', updatedProduct);

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    
    if (product.imageUrl) {
      try {
        await this.cloudinaryService.deleteImage(product.imageUrl);
      } catch (error) {
        console.error('Error deleting product image:', error);
      }
    }
    
    await this.productRepository.delete(id);
    this.eventEmitter.emit('product.deleted', { id });
  }

  async updatePrice(id: string, newPrice: number, userId: string): Promise<Product> {
    const oldProduct = await this.findOne(id);
    const updatedProduct = await this.productRepository.updatePrice(id, newPrice);

    this.eventEmitter.emit('product.price-changed', {
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      oldPrice: oldProduct.price,
      newPrice: updatedProduct.price,
      changedBy: userId,
      changedAt: new Date(),
    });

    if (newPrice < oldProduct.price) {
      try {
        await this.notificationService.sendPriceDropNotification(
          updatedProduct.id,
          updatedProduct.name,
          oldProduct.price,
          newPrice,
          updatedProduct.imageUrl
        );
      } catch (error) {
        console.error('Error al enviar notificación de precio:', error);
      }
    }

    return updatedProduct;
  }

  async bulkCreate(products: CreateProductDto[]): Promise<Product[]> {
    const productsWithDefaults = products.map(p => ({
      ...p,
      isActive: p.isActive ?? true
    }));
    return this.productRepository.bulkCreate(productsWithDefaults);
  }
}

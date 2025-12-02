import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO para actualización de productos (todos los campos opcionales)
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}

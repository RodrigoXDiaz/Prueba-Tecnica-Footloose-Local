import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para creación de productos con validaciones
 */
export class CreateProductDto {
  @ApiProperty({ example: 'Zapato Deportivo', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({ example: 'Nike', description: 'Marca del producto' })
  @IsString()
  @IsNotEmpty({ message: 'La marca es requerida' })
  brand: string;

  @ApiProperty({ example: 'Air Max 270', description: 'Modelo del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El modelo es requerido' })
  model: string;

  @ApiProperty({ example: 'Negro', description: 'Color del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El color es requerido' })
  color: string;

  @ApiProperty({ example: '42', description: 'Talla del producto' })
  @IsString()
  @IsNotEmpty({ message: 'La talla es requerida' })
  size: string;

  @ApiProperty({ example: 129.99, description: 'Precio en Soles Peruanos (S/)' })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  price: number;

  @ApiProperty({ example: 'https://...', required: false, description: 'URL de imagen (opcional, se puede subir como archivo)' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'Descripción del producto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @IsNumber()
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock: number;

  @ApiProperty({ example: true, required: false, description: 'Is product active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

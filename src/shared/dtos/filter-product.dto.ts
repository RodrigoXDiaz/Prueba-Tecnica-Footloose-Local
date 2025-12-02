import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para filtrado de productos
 */
export class FilterProductDto {
  @ApiProperty({ required: false, example: 'Nike' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'Nike' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false, example: 'Rojo' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false, example: '42' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, example: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

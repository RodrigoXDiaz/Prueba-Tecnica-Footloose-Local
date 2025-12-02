import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from '@shared/dtos/create-product.dto';
import { UpdateProductDto } from '@shared/dtos/update-product.dto';
import { FilterProductDto } from '@shared/dtos/filter-product.dto';
import { FirebaseAuthGuard } from '@shared/guards/firebase-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserRole, User } from '@core/interfaces/auth.interface';

/**
 * Product Controller
 * Handles HTTP requests for product operations
 */
@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear un nuevo producto con imagen opcional (Solo Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del producto', example: 'Nike Air Max 90' },
        brand: { type: 'string', description: 'Marca', example: 'Nike' },
        model: { type: 'string', description: 'Modelo', example: 'Air Max 90' },
        color: { type: 'string', description: 'Color', example: 'Negro' },
        size: { type: 'string', description: 'Talla', example: '42' },
        price: { type: 'number', description: 'Precio en Soles (S/)', example: 149.99 },
        stock: { type: 'number', description: 'Stock disponible', example: 25 },
        description: { type: 'string', description: 'Descripción del producto', example: 'Zapatilla deportiva' },
        isActive: { type: 'boolean', description: 'Producto activo', example: true },
        image: { type: 'string', format: 'binary', description: 'Archivo de imagen del producto' },
      },
      required: ['name', 'brand', 'model', 'color', 'size', 'price', 'stock']
    },
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere rol de Admin' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() filters: FilterProductDto) {
    return this.productService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar un producto con imagen opcional (Solo Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del producto', example: 'Nike Air Max 90 Edición Especial' },
        brand: { type: 'string', description: 'Marca', example: 'Nike' },
        model: { type: 'string', description: 'Modelo', example: 'Air Max 90' },
        color: { type: 'string', description: 'Color', example: 'Negro/Blanco' },
        size: { type: 'string', description: 'Talla', example: '42' },
        price: { type: 'number', description: 'Precio en Soles (S/)', example: 169.99 },
        stock: { type: 'number', description: 'Stock disponible', example: 30 },
        description: { type: 'string', description: 'Descripción del producto', example: 'Zapatilla deportiva actualizada' },
        isActive: { type: 'boolean', description: 'Producto activo', example: true },
        image: { type: 'string', format: 'binary', description: 'Nuevo archivo de imagen (opcional)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Producto actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Prohibido - Se requiere rol de Admin' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productService.update(id, updateProductDto, user.id, image);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Patch(':id/price')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar precio de producto (Solo Admin)',
    description: 'Cambia el precio de un producto y notifica automáticamente a todos los usuarios vendedores si el precio baja'
  })
  @ApiBody({
    description: 'Nuevo precio del producto',
    schema: {
      type: 'object',
      properties: {
        price: {
          type: 'number',
          description: 'Nuevo precio en Soles Peruanos (S/)',
          example: 149.99,
          minimum: 0
        }
      },
      required: ['price']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Precio actualizado exitosamente. Si el precio bajó, se envió notificación a todos los usuarios.',
    schema: {
      example: {
        id: '0298f1a2-53e9-4f83-8e14-6100cde1220e',
        name: 'Zapatilla Nike Air Max',
        brand: 'Nike',
        model: 'Air Max 270',
        color: 'Negro',
        size: '42',
        price: 149.99,
        stock: 50,
        imageUrl: 'https://res.cloudinary.com/...',
        description: 'Zapatilla deportiva de alta calidad',
        isActive: true,
        createdAt: '2024-11-29T10:30:00.000Z',
        updatedAt: '2024-12-01T06:54:14.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Se requiere rol de Administrador' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async updatePrice(
    @Param('id') id: string,
    @Body('price') price: number,
    @CurrentUser() user: User,
  ) {
    return this.productService.updatePrice(id, price, user.id);
  }
}

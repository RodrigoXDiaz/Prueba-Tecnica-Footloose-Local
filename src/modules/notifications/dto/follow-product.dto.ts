import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class FollowProductDto {
  @ApiProperty({
    description: 'ID del usuario que seguirá el producto',
    example: 'user123',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'ID del producto a seguir',
    example: 'product456',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de producto es requerido' })
  productId: string;
}

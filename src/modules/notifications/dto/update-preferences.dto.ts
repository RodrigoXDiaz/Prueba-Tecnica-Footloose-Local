import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({
    description: 'Recibir alertas cuando baje el precio de productos seguidos',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  priceDrops?: boolean;

  @ApiProperty({
    description: 'Recibir alertas de nuevas ofertas y descuentos',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  newDiscounts?: boolean;

  @ApiProperty({
    description: 'Recibir alertas cuando productos agotados vuelvan a stock',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  stockAlerts?: boolean;

  @ApiProperty({
    description: 'Recibir noticias generales y novedades de la tienda',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  generalNews?: boolean;
}

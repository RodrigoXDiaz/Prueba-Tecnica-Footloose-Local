import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class SubscribeNotificationDto {
  @ApiProperty({
    description: 'ID del usuario que se suscribe',
    example: 'abc123xyz',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  userId: string;

  @ApiProperty({
    description: 'Token FCM del dispositivo para recibir notificaciones push',
    example: 'dXp2K3h8L9m6N...',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'El token FCM es requerido' })
  fcmToken: string;

  @ApiProperty({
    description: 'Preferencias de notificaciones del usuario',
    example: {
      priceDrops: true,
      newDiscounts: true,
      stockAlerts: true,
      generalNews: false
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  preferences?: {
    priceDrops: boolean;
    newDiscounts: boolean;
    stockAlerts: boolean;
    generalNews: boolean;
  };
}

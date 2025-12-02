import { 
  Controller, 
  Post, 
  Put, 
  Get, 
  Delete,
  Patch,
  Body, 
  Param, 
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SubscribeNotificationDto } from './dto/subscribe-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { FollowProductDto } from './dto/follow-product.dto';
import { FirebaseAuthGuard } from '@shared/guards/firebase-auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { UserRole } from '@core/interfaces/auth.interface';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Suscribir usuario a notificaciones',
    description: 'Registra el token FCM del dispositivo del usuario para recibir notificaciones push'
  })
  @ApiBody({ type: SubscribeNotificationDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario suscrito exitosamente',
    schema: {
      example: {
        message: 'Suscripción exitosa',
        preferences: {
          priceDrops: true,
          newDiscounts: true,
          stockAlerts: true,
          generalNews: false
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async subscribe(@Body() dto: SubscribeNotificationDto) {
    return this.notificationService.subscribeUser(dto);
  }

  @Put('preferences/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Actualizar preferencias de notificaciones',
    description: 'Permite al usuario configurar qué tipos de notificaciones desea recibir'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: 'abc123xyz'
  })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Preferencias actualizadas',
    schema: {
      example: {
        message: 'Preferencias actualizadas exitosamente',
        preferences: {
          priceDrops: true,
          newDiscounts: false,
          stockAlerts: true,
          generalNews: false
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: UpdatePreferencesDto
  ) {
    return this.notificationService.updatePreferences(userId, dto);
  }

  @Post('follow')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Seguir un producto',
    description: 'El usuario seguirá este producto y recibirá alertas cuando baje su precio'
  })
  @ApiBody({ type: FollowProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto seguido exitosamente',
    schema: {
      example: {
        message: 'Ahora sigues este producto. Te notificaremos sobre cambios de precio.',
        subscribedProducts: ['product1', 'product2', 'product3']
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Usuario no suscrito a notificaciones' })
  async followProduct(@Body() dto: FollowProductDto) {
    return this.notificationService.followProduct(dto);
  }

  @Delete('unfollow/:userId/:productId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Dejar de seguir un producto',
    description: 'El usuario dejará de recibir alertas de este producto'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: 'abc123xyz'
  })
  @ApiParam({ 
    name: 'productId', 
    description: 'ID del producto',
    example: 'product456'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dejaste de seguir el producto',
    schema: {
      example: {
        message: 'Dejaste de seguir este producto',
        subscribedProducts: ['product1', 'product2']
      }
    }
  })
  async unfollowProduct(
    @Param('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.notificationService.unfollowProduct(userId, productId);
  }

  @Get('history/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener historial de notificaciones',
    description: 'Devuelve las últimas notificaciones recibidas por el usuario'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario',
    example: 'abc123xyz'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false,
    description: 'Cantidad máxima de notificaciones a devolver',
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial de notificaciones',
    schema: {
      example: {
        total: 10,
        notifications: [
          {
            id: 'notif1',
            type: 'price_drop',
            title: '¡Oferta!',
            body: 'Zapatilla Nike bajó de S/ 200.00 a S/ 150.00 (25% OFF)',
            productId: 'prod123',
            oldPrice: 200,
            newPrice: 150,
            discount: 25,
            sentAt: '2024-11-29T10:30:00Z',
            read: false
          }
        ]
      }
    }
  })
  async getHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return this.notificationService.getNotificationHistory(userId, limit);
  }

  @Post('send/general')
  @Roles(UserRole.ADMIN)
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Enviar notificación general (Admin only)',
    description: 'Permite al administrador enviar notificaciones masivas a usuarios suscritos'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { 
          type: 'string', 
          example: '¡Nueva Colección Disponible! 👟',
          description: 'Título de la notificación'
        },
        body: { 
          type: 'string', 
          example: 'Descubre nuestra nueva colección de zapatillas deportivas con 30% de descuento',
          description: 'Cuerpo del mensaje'
        },
        imageUrl: { 
          type: 'string', 
          example: 'https://example.com/banner.jpg',
          description: 'URL de imagen opcional'
        },
        type: { 
          type: 'string', 
          enum: ['discount', 'stock', 'news'],
          example: 'discount',
          description: 'Tipo de notificación'
        }
      },
      required: ['title', 'body', 'type']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación enviada',
    schema: {
      example: {
        sent: 150,
        failed: 0,
        message: 'Notificación enviada a 150 usuarios'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async sendGeneralNotification(
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('imageUrl') imageUrl?: string,
    @Body('type') type: 'discount' | 'stock' | 'news' = 'news'
  ) {
    return this.notificationService.sendGeneralNotification(title, body, imageUrl, type);
  }

  @Patch(':notificationId/read')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Marcar notificación como leída',
    description: 'Cambia el estado de una notificación a leída'
  })
  @ApiParam({ 
    name: 'notificationId', 
    description: 'ID de la notificación',
    example: 'notif123abc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación marcada como leída',
    schema: {
      example: {
        success: true,
        message: 'Notificación marcada como leída'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async markAsRead(@Param('notificationId') notificationId: string) {
    await this.notificationService.markAsRead(notificationId);
    return {
      success: true,
      message: 'Notificación marcada como leída'
    };
  }

  @Delete(':notificationId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Eliminar notificación',
    description: 'Elimina permanentemente una notificación del historial'
  })
  @ApiParam({ 
    name: 'notificationId', 
    description: 'ID de la notificación',
    example: 'notif123abc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación eliminada',
    schema: {
      example: {
        success: true,
        message: 'Notificación eliminada'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async deleteNotification(@Param('notificationId') notificationId: string) {
    await this.notificationService.deleteNotification(notificationId);
    return {
      success: true,
      message: 'Notificación eliminada'
    };
  }
}

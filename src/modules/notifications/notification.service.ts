import { Injectable, Logger, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SubscribeNotificationDto } from './dto/subscribe-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { FollowProductDto } from './dto/follow-product.dto';

interface NotificationPayload {
  title: string;
  body: string;
  productId?: string;
  oldPrice?: number;
  newPrice?: number;
  discount?: number;
  imageUrl?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly db: admin.firestore.Firestore;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: admin.app.App) {
    this.db = admin.firestore();
  }

  async subscribeUser(dto: SubscribeNotificationDto) {
    try {
      const userNotificationRef = this.db.collection('user_notifications').doc(dto.userId);
      
      const defaultPreferences = {
        priceDrops: true,
        newDiscounts: true,
        stockAlerts: true,
        generalNews: false
      };

      await userNotificationRef.set({
        userId: dto.userId,
        fcmToken: dto.fcmToken,
        preferences: dto.preferences || defaultPreferences,
        subscribedProducts: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      this.logger.log(`Usuario ${dto.userId} suscrito a notificaciones`);

      return {
        message: 'Suscripción exitosa',
        preferences: dto.preferences || defaultPreferences
      };
    } catch (error) {
      this.logger.error(`Error al suscribir usuario: ${error.message}`);
      throw error;
    }
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    try {
      const userNotificationRef = this.db.collection('user_notifications').doc(userId);
      
      const doc = await userNotificationRef.get();
      if (!doc.exists) {
        throw new Error('Usuario no suscrito a notificaciones');
      }

      const currentData = doc.data();
      if (!currentData) {
        throw new Error('Datos de usuario no encontrados');
      }

      await userNotificationRef.update({
        'preferences.priceDrops': dto.priceDrops ?? currentData.preferences.priceDrops,
        'preferences.newDiscounts': dto.newDiscounts ?? currentData.preferences.newDiscounts,
        'preferences.stockAlerts': dto.stockAlerts ?? currentData.preferences.stockAlerts,
        'preferences.generalNews': dto.generalNews ?? currentData.preferences.generalNews,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const updated = await userNotificationRef.get();
      const updatedData = updated.data();

      this.logger.log(`Preferencias actualizadas para usuario ${userId}`);

      return {
        message: 'Preferencias actualizadas exitosamente',
        preferences: updatedData?.preferences
      };
    } catch (error) {
      this.logger.error(`Error al actualizar preferencias: ${error.message}`);
      throw error;
    }
  }

  async followProduct(dto: FollowProductDto) {
    try {
      const userNotificationRef = this.db.collection('user_notifications').doc(dto.userId);
      
      const doc = await userNotificationRef.get();
      if (!doc.exists) {
        throw new Error('Usuario no suscrito a notificaciones. Primero debe suscribirse.');
      }

      const currentData = doc.data();
      if (!currentData) {
        throw new Error('Datos de usuario no encontrados');
      }

      const subscribedProducts = currentData.subscribedProducts || [];
      
      if (subscribedProducts.includes(dto.productId)) {
        return {
          message: 'Ya estás siguiendo este producto',
          subscribedProducts
        };
      }

      await userNotificationRef.update({
        subscribedProducts: admin.firestore.FieldValue.arrayUnion(dto.productId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      this.logger.log(`Usuario ${dto.userId} ahora sigue el producto ${dto.productId}`);

      return {
        message: 'Ahora sigues este producto. Te notificaremos sobre cambios de precio.',
        subscribedProducts: [...subscribedProducts, dto.productId]
      };
    } catch (error) {
      this.logger.error(`Error al seguir producto: ${error.message}`);
      throw error;
    }
  }

  async unfollowProduct(userId: string, productId: string) {
    try {
      const userNotificationRef = this.db.collection('user_notifications').doc(userId);
      
      const doc = await userNotificationRef.get();
      if (!doc.exists) {
        throw new Error('Usuario no encontrado');
      }

      await userNotificationRef.update({
        subscribedProducts: admin.firestore.FieldValue.arrayRemove(productId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const updated = await userNotificationRef.get();
      const updatedData = updated.data();

      this.logger.log(`Usuario ${userId} dejó de seguir el producto ${productId}`);

      return {
        message: 'Dejaste de seguir este producto',
        subscribedProducts: updatedData?.subscribedProducts || []
      };
    } catch (error) {
      this.logger.error(`Error al dejar de seguir producto: ${error.message}`);
      throw error;
    }
  }

  async getNotificationHistory(userId: string, limit: number = 50) {
    try {
      const notificationsRef = this.db
        .collection('notification_history')
        .where('userId', '==', userId)
        .orderBy('sentAt', 'desc')
        .limit(limit);

      const snapshot = await notificationsRef.get();
      
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        total: notifications.length,
        notifications
      };
    } catch (error) {
      this.logger.error(`Error al obtener historial: ${error.message}`);
      throw error;
    }
  }

  async sendPriceDropNotification(
    productId: string,
    productName: string,
    oldPrice: number,
    newPrice: number,
    imageUrl?: string
  ) {
    try {
      const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

      const usersSnapshot = await this.db
        .collection('user_notifications')
        .where('preferences.priceDrops', '==', true)
        .get();

      if (usersSnapshot.empty) {
        this.logger.warn('No hay usuarios suscritos a notificaciones de bajadas de precio');
        return { sent: 0, message: 'No hay usuarios suscritos a notificaciones' };
      }

      const tokens: string[] = [];
      const userIds: string[] = [];

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.fcmToken) {
          tokens.push(data.fcmToken);
          userIds.push(doc.id);
        }
      });

      if (tokens.length === 0) {
        this.logger.warn('No hay tokens FCM válidos para enviar notificaciones');
        return { sent: 0, message: 'No hay tokens FCM válidos' };
      }

      const payload: NotificationPayload = {
        title: '¡Oferta!',
        body: `${productName} bajó de S/ ${oldPrice.toFixed(2)} a S/ ${newPrice.toFixed(2)} (${discount}% OFF)`,
        productId,
        oldPrice,
        newPrice,
        discount,
        imageUrl
      };

      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: {
          productId: payload.productId || '',
          oldPrice: payload.oldPrice?.toString() || '0',
          newPrice: payload.newPrice?.toString() || '0',
          discount: payload.discount?.toString() || '0',
          type: 'price_drop'
        },
        tokens
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`Error enviando a token ${idx}: ${resp.error?.message}`);
          }
        });
      }
      const batch = this.db.batch();
      userIds.forEach(userId => {
        const historyRef = this.db.collection('notification_history').doc();
        batch.set(historyRef, {
          userId,
          type: 'price_drop',
          ...payload,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      });
      await batch.commit();

      return {
        sent: response.successCount,
        failed: response.failureCount,
        message: `Notificación enviada a ${response.successCount} usuarios`
      };
    } catch (error) {
      this.logger.error(`Error al enviar notificación de precio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enviar notificación general (ofertas, novedades, etc)
   */
  async sendGeneralNotification(
    title: string,
    body: string,
    imageUrl?: string,
    type: 'discount' | 'stock' | 'news' = 'news'
  ) {
    try {
      const preferenceMap = {
        discount: 'newDiscounts',
        stock: 'stockAlerts',
        news: 'generalNews'
      };

      const preference = preferenceMap[type];

      const usersSnapshot = await this.db
        .collection('user_notifications')
        .where(`preferences.${preference}`, '==', true)
        .get();

      if (usersSnapshot.empty) {
        return { sent: 0, message: 'No hay usuarios suscritos a este tipo de notificación' };
      }

      const tokens: string[] = [];
      const userIds: string[] = [];

      usersSnapshot.forEach(doc => {
        tokens.push(doc.data().fcmToken);
        userIds.push(doc.id);
      });

      const message = {
        notification: {
          title,
          body,
          imageUrl
        },
        data: {
          type,
          timestamp: Date.now().toString()
        },
        tokens
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      const batch = this.db.batch();
      userIds.forEach(userId => {
        const historyRef = this.db.collection('notification_history').doc();
        batch.set(historyRef, {
          userId,
          type,
          title,
          body,
          imageUrl,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      });
      await batch.commit();

      return {
        sent: response.successCount,
        failed: response.failureCount,
        message: `Notificación enviada a ${response.successCount} usuarios`
      };
    } catch (error) {
      this.logger.error(`Error al enviar notificación general: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = this.db
        .collection('notification_history')
        .doc(notificationId);

      const doc = await notificationRef.get();
      
      if (!doc.exists) {
        throw new Error('Notificación no encontrada');
      }

      await notificationRef.update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      this.logger.error(`Error al marcar notificación como leída: ${error.message}`);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = this.db
        .collection('notification_history')
        .doc(notificationId);

      const doc = await notificationRef.get();
      
      if (!doc.exists) {
        throw new Error('Notificación no encontrada');
      }

      await notificationRef.delete();
    } catch (error) {
      this.logger.error(`Error al eliminar notificación: ${error.message}`);
      throw error;
    }
  }
}

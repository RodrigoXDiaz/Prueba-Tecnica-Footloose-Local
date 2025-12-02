import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UnauthorizedException } from '@core/exceptions/business.exception';

/**
 * Guard de Autenticación Firebase
 * Valida tokens JWT en rutas protegidas
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject('FIREBASE_AUTH')
    private readonly firebaseAuth: admin.auth.Auth,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(token);
      
      const firestore = admin.firestore();
      const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const userData = userDoc.data();
      
      request.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
        role: userData?.role,
        displayName: userData?.displayName,
        photoURL: userData?.photoURL,
        isActive: userData?.isActive,
        createdAt: userData?.createdAt?.toDate(),
        updatedAt: userData?.updatedAt?.toDate(),
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

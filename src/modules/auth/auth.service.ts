import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { User, UserRole, AuthResponse } from '@core/interfaces/auth.interface';
import { RegisterDto } from '@shared/dtos/register.dto';
import { LoginDto } from '@shared/dtos/login.dto';
import { BusinessException, UnauthorizedException } from '@core/exceptions/business.exception';

/**
 * Servicio de Autenticación
 * Maneja registro, login y verificación de tokens con Firebase
 */
@Injectable()
export class AuthService {
  private readonly firebaseApiKey: string;

  constructor(
    @Inject('FIREBASE_AUTH')
    private readonly firebaseAuth: admin.auth.Auth,
    @Inject('FIRESTORE')
    private readonly firestore: admin.firestore.Firestore,
    private readonly configService: ConfigService,
  ) {
    this.firebaseApiKey = this.configService.get<string>('FIREBASE_WEB_API_KEY') || '';
  }

  /**
   * Registra un nuevo usuario en Firebase Auth y Firestore
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      if (!this.firebaseApiKey || this.firebaseApiKey === 'AIzaSyDuJ8QYc9xVZqXxK_1234567890abcdefg') {
        console.error('FIREBASE_WEB_API_KEY no está configurada correctamente en el archivo .env');
        console.error('Por favor, configura tu Firebase Web API Key en las variables de entorno');
        throw new BusinessException(
          'Configuración de Firebase incompleta. Contacte al administrador.',
          'FIREBASE_CONFIG_ERROR',
          500
        );
      }

      const signUpResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.firebaseApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registerDto.email,
            password: registerDto.password,
            returnSecureToken: true,
          }),
        },
      );

      if (!signUpResponse.ok) {
        const error = await signUpResponse.json();
        console.error('Error en Firebase Auth API:', error);
        
        if (error.error?.message === 'EMAIL_EXISTS') {
          throw new BusinessException('El email ya está registrado', 'EMAIL_EXISTS', 409);
        }
        if (error.error?.message === 'INVALID_API_KEY') {
          throw new BusinessException(
            'API Key de Firebase inválida. Verifica la configuración.',
            'INVALID_API_KEY',
            500
          );
        }
        throw new BusinessException(
          `Error al registrar usuario: ${error.error?.message || 'Error desconocido'}`,
          'REGISTRATION_ERROR',
          500
        );
      }

      const signUpData = await signUpResponse.json();
      const uid = signUpData.localId;
      const idToken = signUpData.idToken;

      await this.firebaseAuth.updateUser(uid, {
        displayName: registerDto.displayName,
      });

      const userData: Omit<User, 'id'> = {
        email: registerDto.email,
        displayName: registerDto.displayName,
        role: registerDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await this.firestore
        .collection('users')
        .doc(uid)
        .set({
          ...userData,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

      const user: User = {
        id: uid,
        ...userData,
      };

      return {
        user,
        token: idToken,
      };
    } catch (error: any) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('Error al registrar usuario', 'REGISTRATION_ERROR', 500);
    }
  }

  /**
   * Login con Firebase REST API para obtener token JWT
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      if (!this.firebaseApiKey || this.firebaseApiKey === 'AIzaSyDuJ8QYc9xVZqXxK_1234567890abcdefg') {
        console.error('FIREBASE_WEB_API_KEY no está configurada correctamente en el archivo .env');
        console.error('Por favor, configura tu Firebase Web API Key en las variables de entorno');
        throw new UnauthorizedException('Configuración de Firebase incompleta. Contacte al administrador.');
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginDto.email,
            password: loginDto.password,
            returnSecureToken: true,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error en Firebase Auth API (login):', error);
        
        if (error.error?.message === 'INVALID_LOGIN_CREDENTIALS' ||
            error.error?.message === 'EMAIL_NOT_FOUND' ||
            error.error?.message === 'INVALID_PASSWORD') {
          throw new UnauthorizedException('Credenciales inválidas');
        }
        if (error.error?.message === 'INVALID_API_KEY') {
          throw new UnauthorizedException('API Key de Firebase inválida. Verifica la configuración.');
        }
        throw new UnauthorizedException(`Error al iniciar sesión: ${error.error?.message || 'Error desconocido'}`);
      }

      const data = await response.json();
      const idToken = data.idToken;
      const uid = data.localId;

      const userDoc = await this.firestore.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const userData = userDoc.data() as Omit<User, 'id'>;

      if (!userData.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      const user: User = {
        id: uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        photoURL: userData.photoURL,
        createdAt: (userData.createdAt as any)?.toDate ? (userData.createdAt as any).toDate() : userData.createdAt as Date,
        updatedAt: (userData.updatedAt as any)?.toDate ? (userData.updatedAt as any).toDate() : userData.updatedAt as Date,
        isActive: userData.isActive,
      };

      return {
        user,
        token: idToken,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  async getUserById(uid: string): Promise<User | null> {
    const userDoc = await this.firestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data()!;

    return {
      id: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt?.toDate(),
      updatedAt: userData.updatedAt?.toDate(),
      isActive: userData.isActive ?? true,
    };
  }

  /**
   * Actualiza el rol de un usuario (solo Admin)
   */
  async updateUserRole(uid: string, role: UserRole): Promise<User> {
    const userDoc = await this.firestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new BusinessException('Usuario no encontrado', 'USER_NOT_FOUND', 404);
    }

    await this.firestore.collection('users').doc(uid).update({
      role,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return this.getUserById(uid) as Promise<User>;
  }

  /**
   * Verifica la validez del token JWT de Firebase
   */
  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.firebaseAuth.verifyIdToken(idToken);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

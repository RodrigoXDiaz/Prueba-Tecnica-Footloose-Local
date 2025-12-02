import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

/**
 * Proveedor de Firebase
 * Inicializa Firebase Admin SDK desde archivo JSON o variables de entorno
 */
const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const serviceAccountPath = configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
    
    if (serviceAccountPath) {
      try {
        const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
        const serviceAccount = require(absolutePath);
        
        console.log('Firebase configurado correctamente');
        console.log(`Proyecto: ${serviceAccount.project_id}`);
        console.log(`Storage Bucket: ${configService.get<string>('FIREBASE_STORAGE_BUCKET')}`);
        
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
        });
      } catch (error) {
        console.error('Error loading Firebase service account file:', error);
        console.error('Path intentado:', serviceAccountPath);
        throw error;
      }
    }

    const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || projectId === 'your-project-id' || 
        !privateKey || privateKey.includes('Your') || privateKey.includes('Key') ||
        !clientEmail || clientEmail.includes('xxxxx')) {
      console.error('\nFIREBASE NOT CONFIGURED');
      console.error('Please configure Firebase credentials in one of these ways:');
      console.error('1. Set FIREBASE_SERVICE_ACCOUNT_PATH to your service account JSON file path');
      console.error('2. Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL');
      console.error('See backend/docs/FIREBASE_SETUP.md for detailed instructions\n');
      
      throw new Error('Firebase credentials not configured. Please check .env file.');
    }

    const firebaseConfig = {
      projectId,
      privateKey: privateKey?.replace(/\\n/g, '\n'),
      clientEmail,
    };

    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
    });
  },
};

const firestoreProvider = {
  provide: 'FIRESTORE',
  inject: ['FIREBASE_APP'],
  useFactory: (firebaseApp: admin.app.App) => firebaseApp.firestore(),
};

const firebaseAuthProvider = {
  provide: 'FIREBASE_AUTH',
  inject: ['FIREBASE_APP'],
  useFactory: (firebaseApp: admin.app.App) => firebaseApp.auth(),
};

const firebaseStorageProvider = {
  provide: 'FIREBASE_STORAGE',
  inject: ['FIREBASE_APP'],
  useFactory: (firebaseApp: admin.app.App) => firebaseApp.storage(),
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    firebaseProvider,
    firestoreProvider,
    firebaseAuthProvider,
    firebaseStorageProvider,
  ],
  exports: [
    'FIREBASE_APP',
    'FIRESTORE',
    'FIREBASE_AUTH',
    'FIREBASE_STORAGE',
  ],
})
export class FirebaseModule {}

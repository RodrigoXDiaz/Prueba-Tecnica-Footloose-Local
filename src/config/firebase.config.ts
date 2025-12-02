/**
 * Firebase Client Configuration
 * 
 * Esta configuración es para el SDK de Firebase en el cliente (frontend).
 * El backend usa Firebase Admin SDK con el service account JSON.
 * 
 * IMPORTANTE: Esta configuración es segura para exponer en el frontend.
 * Las reglas de seguridad de Firebase protegen tus datos.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyCEVDiUk-rSpvV1L_zclm2Rz_GVRaudBnI",
  authDomain: "footloose-prueba.firebaseapp.com",
  projectId: "footloose-prueba",
  storageBucket: "footloose-prueba.firebasestorage.app",
  messagingSenderId: "616106295586",
  appId: "1:616106295586:web:030a04bf0cc4eeef9ca57b",
  measurementId: "G-5L4QDPVPGK"
};

/**
 * Endpoints de Firebase Auth REST API
 * Usados por el backend para autenticación
 */
export const FIREBASE_AUTH_ENDPOINTS = {
  SIGN_UP: 'https://identitytoolkit.googleapis.com/v1/accounts:signUp',
  SIGN_IN: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
  REFRESH_TOKEN: 'https://securetoken.googleapis.com/v1/token',
  VERIFY_PASSWORD: 'https://identitytoolkit.googleapis.com/v1/accounts:resetPassword',
  GET_USER: 'https://identitytoolkit.googleapis.com/v1/accounts:lookup',
};

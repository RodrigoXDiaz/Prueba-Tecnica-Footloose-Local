/**
 * User roles enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
}

/**
 * User entity interface
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Authentication request DTO
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  uid: string;
  email: string;
  role: UserRole;
}

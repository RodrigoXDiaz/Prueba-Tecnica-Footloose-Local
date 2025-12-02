import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para login de usuario
 */
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

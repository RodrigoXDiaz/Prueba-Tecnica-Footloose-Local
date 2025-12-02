import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@core/interfaces/auth.interface';

/**
 * DTO para registro de usuario
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  displayName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.VENDEDOR })
  @IsEnum(UserRole, { message: 'El rol debe ser ADMIN o VENDEDOR' })
  role: UserRole;
}

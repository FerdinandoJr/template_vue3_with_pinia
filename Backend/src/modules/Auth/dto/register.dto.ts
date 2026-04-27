import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'tenant-uuid', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ example: 'abc123token', required: false })
  @IsOptional()
  @IsString()
  verificationToken?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RequestVerificationDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'abc123token' })
  @IsString()
  token: string;
}
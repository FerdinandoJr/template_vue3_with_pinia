import { IsString, IsEmail, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CustomerStatus } from '../data/customer.entity';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Empresa XYZ', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'contato@empresa.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '11999999999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Empresa XYZ LTDA', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: 'Empresa XYZ LTDA', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: 'Rua ABC, 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '12345678901234', required: false })
  @IsOptional()
  @Matches(/^\d{11}|\d{14}$/, { message: 'Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)' })
  document?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  responsibleName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, enum: CustomerStatus })
  @IsOptional()
  status?: CustomerStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
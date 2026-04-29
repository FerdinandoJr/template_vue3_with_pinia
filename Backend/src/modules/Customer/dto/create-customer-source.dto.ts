import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerSourceDto {
  @ApiProperty({ example: 'Website' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

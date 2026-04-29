import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerSourceDto {
  @ApiProperty({ example: 'Website' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

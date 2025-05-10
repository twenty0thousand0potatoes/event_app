import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDescriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

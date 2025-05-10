import { IsString, Length } from 'class-validator';

export class UpdateCityDto {
  @IsString()
  @Length(1, 100)
  city: string;
}

import { IsInt, Min, Max } from 'class-validator';

export class UpdateAgeDto {
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;
}

import { IsString, MinLength } from 'class-validator'

export class UpdateUsernameDto {
  @IsString()
  @MinLength(2)
  username: string
}

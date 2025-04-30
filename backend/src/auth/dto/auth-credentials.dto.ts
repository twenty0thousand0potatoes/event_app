import { IsEmail, IsString, maxLength, MaxLength, MinLength } from "class-validator";


export class AuthCredentialsDto{

    @IsString()
    @MinLength(4)
    @MaxLength(20)
    @IsEmail()
    email:string

    @MinLength(6)
    @MaxLength(30)
    @IsString()
    password:string


}
import { IsEmail, IsMobilePhone, IsString, Length } from "class-validator";
import { ConfirmedPassword } from "src/common/decorators/password.decorator";

export class SignupDto {
    @IsString()
    first_name: string;
    @IsString()
    last_name: string;
    @IsMobilePhone("fa-IR", {}, {message: "Your phone number format is incorrect!"})
    mobile: string;
    @IsString()
    @IsEmail({}, {message: "Your email format is incorrect!"})
    email: string;
    @IsString()
    @Length(6, 20, {message: "Your password format is incorrect!"})
    password: string;
    @IsString()
    @ConfirmedPassword("password")
    confirm_password: string;
}

export class LoginDto {
    @IsString()
    @IsEmail({}, {message: "Your email format is incorrect!"})
    email: string;
    @IsString()
    @Length(6, 20, {message: "Your password format is incorrect!"})
    password: string;
}
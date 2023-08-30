import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { Helper } from "../../shared/utils";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: Helper.faker.internet.email(),
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "password",
  })
  password: string;
}

export class RegisterDto {
  @IsNotEmpty()
  @ApiProperty({
    example: Helper.faker.name.firstName(),
  })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({
    example: Helper.faker.name.lastName(),
  })
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: Helper.faker.internet.email(),
  })
  email: string;

  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: Helper.faker.phone.phoneNumber(),
  })
  phoneNumber: string;

  @IsNotEmpty()
  @ApiProperty({
    example: "password",
  })
  password: string;
}

export interface AuthPayload {
  id: number;
}

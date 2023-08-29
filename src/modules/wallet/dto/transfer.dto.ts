import { IsEmail, IsNotEmpty, Min } from "class-validator";

export class TransferFunds {
  @IsNotEmpty()
  @Min(100)
  amount: number;

  @IsNotEmpty()
  @IsEmail()
  recipientEmail: string;
}

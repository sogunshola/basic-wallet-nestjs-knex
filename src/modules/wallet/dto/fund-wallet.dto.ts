import { IsNotEmpty, IsOptional, Min } from "class-validator";

export class FundWalletDto {
  @IsNotEmpty()
  @Min(100, {
    message: "Amount must be greater than or equal to 100 Naira",
  })
  amount: number;
}

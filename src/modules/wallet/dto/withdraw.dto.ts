import { IsNotEmpty, Min } from 'class-validator';

export class WithdrawFromWalletDto {
  @IsNotEmpty()
  accountNumber: string;

  @IsNotEmpty()
  bankCode: string;

  @IsNotEmpty()
  @Min(100)
  amount: number;
}

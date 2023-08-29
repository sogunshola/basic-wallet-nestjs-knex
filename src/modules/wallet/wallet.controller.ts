import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { resolveResponse } from "../../shared/resolvers";
import { FundWalletDto } from "./dto/fund-wallet.dto";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { TransferFunds } from "./dto/transfer.dto";
import { User } from "../users/interface/user.interface";
import { WithdrawFromWalletDto } from "./dto/withdraw.dto";

@ApiTags("Wallets")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post("fund")
  fundFiatWallet(
    @Body() fundFiatWallet: FundWalletDto,
    @CurrentUser() user: User
  ) {
    return resolveResponse(this.walletService.fundWallet(fundFiatWallet, user));
  }

  @Post("transfer")
  transferFunds(
    @Body() transferFunds: TransferFunds,
    @CurrentUser() user: User
  ) {
    return resolveResponse(
      this.walletService.transferFunds(transferFunds, user)
    );
  }

  @Post('withdraw')
  withdrawFromWallet(@Body() withdrawFromWallet: WithdrawFromWalletDto, @CurrentUser() user: User) {
    return resolveResponse(this.walletService.withdrawFund(withdrawFromWallet, user));
  }
}

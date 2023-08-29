import { Module } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { PaystackService } from "../../shared/plugins/paystack/paystack.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, PaystackService],
  exports: [WalletService],
})
export class WalletModule {}

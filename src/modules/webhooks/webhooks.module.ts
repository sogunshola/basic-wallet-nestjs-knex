import { Module } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { WebhooksController } from "./webhooks.controller";
import { WalletModule } from "../wallet/wallet.module";
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService],
  imports: [WalletModule, TransactionsModule],
})
export class WebhooksModule {}

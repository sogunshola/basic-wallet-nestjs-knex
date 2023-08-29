import { TransactionsService } from "./../transactions/transactions.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { PaystackEvents, WebhookDto } from "./dto/interface";
import env from "../../config/env.config";
import { AppEvents } from "../../constants";
import { Helper } from "../../shared/utils";
import { TransactionStatus } from "../transactions/dto/transactions.enum";
import { Knex } from "knex";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { WalletService } from "../wallet/wallet.service";
import { Transaction } from "../transactions/interface/transaction.interface";

@Injectable()
export class WebhooksService {
  constructor(
    @InjectKnex() readonly knex: Knex,
    private readonly walletService: WalletService,
    private readonly transactionsService: TransactionsService
  ) {}
  private async verifyPaystackWebhook(
    eventBody: WebhookDto<any>,
    eventHeader: unknown
  ) {
    const hash = crypto
      .createHmac("sha512", env.paystack.testApiKey)
      .update(JSON.stringify(eventBody))
      .digest("hex");
    if (hash === eventHeader["x-paystack-signature"]) {
      return eventBody;
    }
    throw new BadRequestException("Invalid signature");
  }

  async handlePaystackWebhook(
    eventBody: WebhookDto<unknown>,
    eventHeader: unknown
  ) {
    const response = await this.verifyPaystackWebhook(eventBody, eventHeader);
    const { event, data } = response;
    const { reference } = data;
    console.log(eventBody);
    const transaction = await this.transactionsService.findOne(
      reference,
      "reference"
    );
    if (!transaction) {
      throw new BadRequestException("Transaction not found");
    }
    if (event === PaystackEvents.CHARGE_SUCCESS) {
      await this.handleChargeSuccess(transaction, data);
    }
    if (event === PaystackEvents.TRANSFER_SUCCESS) {
      await this.handleTransferSuccess(transaction, data);
    }
    if (event === PaystackEvents.TRANSFER_FAILED) {
      await this.handleTransferFailed(transaction, data);
    }
    if (event === PaystackEvents.TRANSFER_REVERSED) {
      await this.handleTransferReversed(transaction, data);
    }
  }

  private async handleChargeSuccess(transaction: Transaction, data: any) {
    const { status, fees } = data;
    if (status !== "success") {
      throw new BadRequestException("Failed transaction");
    }
    if (transaction.status === TransactionStatus.SUCCESSFUL) {
      return {
        message: "Transaction already successful",
      };
    }
    const wallet = await this.walletService.findOne(
      transaction.userId,
      "userId"
    );
    console.log({ wallet });
    transaction.status = TransactionStatus.SUCCESSFUL;
    transaction.meta = JSON.stringify({
      ...JSON.parse(transaction.meta),
      previousBalance: wallet.balance,
      newBalance: wallet.balance + parseFloat(transaction.amount.toString()),
      transactionFee: fees / 100,
    });
    transaction.serverMeta = JSON.stringify(data);
    console.log({ transaction });
    const result = await this.knex
      .transaction(async (trx) => {
        await trx("wallets")
          .where({ id: wallet.id })
          .increment("balance", parseFloat(transaction.amount.toString()));
        await trx("transactions")
          .where({ id: transaction.id })
          .update(transaction);
      })
      .catch((error) => {
        throw error;
      });
    return result;
    // const pushNotification: PushNotification = {
    //   title: "Transaction Successful",
    //   body: `Your transaction of ${Helper.moneyFormat(
    //     transaction.amount
    //   )} was successful`,
    //   token: transaction.user.deviceToken,
    // };
    // this.eventEmitter.emit(AppEvents.SEND_NOTIFICATION, pushNotification);
  }

  private async handleTransferSuccess(transaction: Transaction, data: any) {
    const { status, fees } = data;
    if (status !== "success") {
      throw new BadRequestException("Failed transaction");
    }
    if (transaction.status === TransactionStatus.SUCCESSFUL) {
      return {
        message: "Transaction already successful",
      };
    }
    const wallet = await this.walletService.findOne(
      transaction.userId,
      "userId"
    );
    console.log({ wallet });
    transaction.status = TransactionStatus.SUCCESSFUL;
    transaction.meta = JSON.stringify({
      ...JSON.parse(transaction.meta),
      previousBalance: wallet.balance,
      newBalance: wallet.balance - parseFloat(transaction.amount.toString()),
      transactionFee: fees / 100,
    });
    transaction.serverMeta = JSON.stringify(data);
    console.log({ transaction });
    const result = await this.knex
      .transaction(async (trx) => {
        await trx("transactions")
          .where({ id: transaction.id })
          .update(transaction);
      })
      .catch((error) => {
        throw error;
      });
    return result;
  }

  private async handleTransferFailed(transaction: Transaction, data: any) {
    const { status } = data;
    if (status !== "failed") {
      throw new BadRequestException("Failed transaction");
    }
    if (transaction.status === TransactionStatus.FAILED) {
      return {
        message: "Transaction already failed",
      };
    }
    transaction.status = TransactionStatus.FAILED;
    transaction.serverMeta = JSON.stringify(data);
    console.log({ transaction });
    const wallet = await this.walletService.findOne(
      transaction.userId,
      "userId"
    );
    const result = await this.knex
      .transaction(async (trx) => {
        await trx("wallets")
          .where({ id: wallet.id })
          .increment("balance", parseFloat(transaction.amount.toString()));
        await trx("transactions")
          .where({ id: transaction.id })
          .update(transaction);
      })
      .catch((error) => {
        throw error;
      });
    return result;
  }

  private async handleTransferReversed(transaction: Transaction, data: any) {
    const { status } = data;
    if (status !== "reversed") {
      throw new BadRequestException("Failed transaction");
    }
    if (transaction.status === TransactionStatus.CANCELLED) {
      return {
        message: "Transaction already reversed",
      };
    }
    transaction.status = TransactionStatus.CANCELLED;
    transaction.serverMeta = JSON.stringify(data);
    console.log({ transaction });
    const wallet = await this.walletService.findOne(
      transaction.userId,
      "userId"
    );
    const result = await this.knex
      .transaction(async (trx) => {
        await trx("wallets")
          .where({ id: wallet.id })
          .increment("balance", parseFloat(transaction.amount.toString()));
        await trx("transactions")
          .where({ id: transaction.id })
          .update(transaction);
      })
      .catch((error) => {
        throw error;
      });
    return result;
  }
}

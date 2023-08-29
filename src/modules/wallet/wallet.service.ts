import { BadRequestException, Injectable } from "@nestjs/common";
import { PaystackService } from "../../shared/plugins/paystack/paystack.service";
import { Knex } from "knex";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { BaseService } from "../../shared/services/base-service.service";
import { FundWalletDto } from "./dto/fund-wallet.dto";
import { Helper } from "../../shared/utils";
import {
  TransactionOperations,
  TransactionStatus,
  TransactionTypes,
} from "../transactions/dto/transactions.enum";
import { Wallet } from "./interfaces/wallet.interface";
import { TransferFunds } from "./dto/transfer.dto";
import { WithdrawFromWalletDto } from "./dto/withdraw.dto";
import { User } from "../users/interface/user.interface";


@Injectable()
export class WalletService extends BaseService<Wallet> {
  constructor(
    @InjectKnex() readonly knex: Knex,
    private readonly paystackService: PaystackService
  ) {
    super(knex, "wallets");
  }

  async findUserWallet(user: User) {
    return this.knex("wallets").where({ userId: user.id }).first();
  }

  async fundWallet(payload: FundWalletDto, user: User) {
    const wallet = await this.findUserWallet(user);
    const data = await this.initializeTransaction(
      payload,
      user,
      wallet.currency
    );
    const transaction = await this.createTransaction(payload.amount, user, data);
    return { ...data, transactionId: transaction[0] };
  }

  async transferFunds(payload: TransferFunds, user: User) {
    const { amount, recipientEmail } = payload;
    await this.checkBalance(amount, user);
    const receiver = await this.findUserByEmail(recipientEmail);
    await this.knex.transaction(async (trx) => {
      await this.updateWalletBalance(trx, user.id, -amount);
      await this.updateWalletBalance(trx, receiver.id, amount);
      await this.createTransferTransaction(trx, user, receiver, amount);
    });
    return { message: "Transfer successful" };
  }

  async withdrawFund(
    payload: WithdrawFromWalletDto,
    user: User
  ) {
    const { amount } = payload;
    const wallet = await this.checkBalance(amount, user);
    const account = await this.verifyAccount(payload);
    const recipient = await this.createTransferRecipient(
      payload,
      account,
      wallet.currency
    );
    const data = await this.makeTransfer(payload, recipient);
    await this.knex("wallets")
      .where({ userId: user.id })
      .decrement("balance", amount);
    const transaction = await this.createTransaction(amount, user, data, {
      previousBalance: wallet.balance,
      newBalance: wallet.balance - amount,
    });
    return { ...data, transactionId: transaction[0] };
  }

  private async initializeTransaction(
    payload: FundWalletDto,
    user: Record<string, any>,
    currency: string
  ) {
    const { amount } = payload;
    const { data } = await this.paystackService.initializeTransaction({
      amount,
      email: user.email,
      reference: Helper.randString(6, 4, 4),
      currency,
    });
    return data;
  }

  private async createTransaction(
    amount: number,
    user: Record<string, any>,
    data: any,
    meta?: any
  ) {
    return this.knex("transactions").insert({
      amount: amount,
      userId: user.id,
      reference: data.reference,
      status: TransactionStatus.PENDING,
      type: TransactionTypes.DEPOSIT,
      operation: TransactionOperations.CREDIT,
      meta: {
        receiver: "self",
        ...meta,
      },
      serverMeta: data,
    });
  }

  private async findUserByEmail(email: string) {
    const receiver = await this.knex("users").where({ email }).first();
    if (!receiver) {
      throw new BadRequestException("Recipient not found");
    }
    return receiver;
  }

  private async updateWalletBalance(
    trx: Knex.Transaction,
    userId: number,
    amount: number
  ) {
    return trx("wallets").where({ userId }).increment("balance", amount);
  }

  private async createTransferTransaction(
    trx: Knex.Transaction,
    sender: Record<string, any>,
    receiver: Record<string, any>,
    amount: number
  ) {
    const reference = Helper.randString(6, 4, 4);
    await trx("transactions").insert([
      {
        amount,
        userId: sender.id,
        reference,
        status: TransactionStatus.PENDING,
        type: TransactionTypes.TRANSFER,
        operation: TransactionOperations.DEBIT,
        meta: {
          receiver: receiver.email,
          sender: sender.email,
        },
      },
      {
        amount,
        userId: receiver.id,
        reference,
        status: TransactionStatus.PENDING,
        type: TransactionTypes.TRANSFER,
        operation: TransactionOperations.CREDIT,
        meta: {
          receiver: receiver.email,
          sender: sender.email,
        },
      },
    ]);
  }

  private async verifyAccount(payload: WithdrawFromWalletDto) {
    const { accountNumber, bankCode } = payload;
    const { data } = await this.paystackService.verifyAccountNumber({
      accountNumber,
      bankCode,
    });
    return data;
  }

  private async createTransferRecipient(
    payload: WithdrawFromWalletDto,
    account: any,
    currency: string
  ) {
    const { accountNumber, bankCode } = payload;
    const recipient = await this.paystackService.createTransferRecipient({
      account_number: accountNumber,
      bank_code: bankCode,
      currency,
      name: account.account_name,
      type: "nuban",
    });
    return recipient.data;
  }

  private async makeTransfer(payload: WithdrawFromWalletDto, recipient: any) {
    const { amount } = payload;
    const { data } = await this.paystackService.makeTransfer({
      amount: amount * 100,
      recipient: recipient.recipient_code,
      reference: Helper.randString(6, 4, 4),
      source: "balance",
    });
    return data;
  }

  private async checkBalance(amount: number, user: User) {
    const wallet = await this.findUserWallet(user);
    if (wallet.balance < amount) {
      throw new BadRequestException("Insufficient funds");
    }
    return wallet;
  }
}

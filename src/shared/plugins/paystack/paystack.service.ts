import {
  ChargeAuthorizationDto,
  CreateTransferRecipientDto,
  GetBanksResponse,
  InitTransaferDto,
  PaystackTransactionPayload,
  PaystackTransactionResponse,
  VerificationResponse,
  VerifyAccountNumberDto,
} from "./paystack.interfaces";
import { BadRequestException, Injectable } from "@nestjs/common";
import { RequestController } from "../../../core";
import env from "../../../config/env.config";

@Injectable()
export class PaystackService {
  private readonly base_url = env.paystack.baseUrl;
  private readonly api_key = env.paystack.testApiKey;

  constructor(private requestController: RequestController) {}

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${this.api_key}`,
    };
  }

  async initializeTransaction(payload: PaystackTransactionPayload) {
    const url = `${this.base_url}/transaction/initialize/`;
    const amount = payload.amount * 100;
    const response = await this.requestController.post<
      PaystackTransactionResponse,
      PaystackTransactionPayload
    >(
      url,
      undefined,
      {
        email: payload.email,
        amount,
        reference: payload.reference,
        metadata: payload.metadata,
        callback_url: payload.callback_url,
        currency: payload.currency,
      },
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async verifyAccountNumber(dto: VerifyAccountNumberDto) {
    const url = `${this.base_url}/bank/resolve?account_number=${dto.accountNumber}&bank_code=${dto.bankCode}`;
    const response = await this.requestController.get<VerificationResponse>(
      url,
      undefined,
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async createTransferRecipient(dto: CreateTransferRecipientDto) {
    const url = `${this.base_url}/transferrecipient`;
    const response = await this.requestController.post<any, any>(
      url,
      undefined,
      dto,
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async chargeAuthorization(dto: ChargeAuthorizationDto) {
    const url = `${this.base_url}/transaction/charge_authorization`;
    const amount = dto.amount * 100;
    const response = await this.requestController.post<
      PaystackTransactionResponse,
      ChargeAuthorizationDto
    >(
      url,
      undefined,
      { ...dto, amount },
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async makeTransfer(dto: InitTransaferDto) {
    const url = `${this.base_url}/transfer`;
    const response = await this.requestController.post<
      PaystackTransactionResponse,
      InitTransaferDto
    >(
      url,
      undefined,
      {
        source: dto.source,
        reference: dto.reference,
        recipient: dto.recipient,
        amount: dto.amount * 100,
      },
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async verify(reference: string) {
    const url = `${this.base_url}/transaction/verify/${reference}`;
    const response = await this.requestController.get<VerificationResponse>(
      url,
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async detail(transactionId: number) {
    const url = `${this.base_url}/transaction/${transactionId}`;
    const response = await this.requestController.get<VerificationResponse>(
      url,
      {
        headers: this.getHeaders(),
      }
    );
    return response;
  }

  async getBanks() {
    const url = `${this.base_url}/bank?country=nigeria`;
    const response = await this.requestController.get<GetBanksResponse>(url, {
      headers: this.getHeaders(),
    });
    return response;
  }
}

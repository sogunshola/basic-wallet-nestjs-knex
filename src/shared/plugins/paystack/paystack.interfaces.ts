export interface PaystackTransactionPayload {
  reference: string;
  amount: number;
  email: string;
  metadata?: unknown;
  currency: string;
  callback_url?: string;
}

export interface PaystackTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference?: string;
  };
}

export interface PaystackCreatePlanDto {
  name: string;
  interval: string;
  amount: number;
  send_invoices: boolean;
  currency: string;
}

export interface PaystackCreateSubDto {
  reference: string;
  amount: number;
  email: string;
  metadata: any;
  currency: string;
  callback_url: string;
  plan: string;
}

export interface PlanResponse {
  status: boolean;
  message: string;
  data: any;
}

export interface VerificationResponse {
  status: boolean;
  message: string;
  data?: any;
}

export interface VerifyAccountNumberDto {
  accountNumber: string;
  bankCode: string;
}

export interface Bank {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetBanksResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

export interface CreateTransferRecipientDto {
  type: string;
  name?: string;
  account_number: string;
  bank_code: string;
  currency: string;
}

export interface InitTransaferDto {
  source: string;
  amount: number;
  recipient: string;
  reference: string;
}

export interface ChargeAuthorizationDto {
  authorization_code: string;
  email: string;
  amount: number;
}

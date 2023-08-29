export enum TransactionOperations {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum TransactionTypes {
  WITHDRAWAL = "withdrawal",
  DEPOSIT = "deposit",
  TRANSFER = "transfer",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESSFUL = "successful",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

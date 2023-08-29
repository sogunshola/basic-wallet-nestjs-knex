import { TransactionOperations, TransactionStatus, TransactionTypes } from "../dto/transactions.enum";

export interface Transaction {
    id: number;
    deletedAt: Date;
    amount: number;
    status: TransactionStatus;
    operation: TransactionOperations;
    reference: string;
    userId: string;
    meta: any;
    serverMeta: any;
    type: TransactionTypes;
    createdAt: Date;
    updatedAt: Date;
}
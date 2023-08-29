import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "./wallet.service";
import Knex from "knex";
import { createTracker, MockClient, Tracker } from "knex-mock-client";
import { PaystackService } from "../../shared/plugins/paystack/paystack.service";
import { dbConfig } from "../../config/db.config";
import { TransferFunds } from "./dto/transfer.dto";

jest.mock("../../config/db.config", () => {
  return {
    dbConfig: Knex({ client: MockClient }),
  };
});
describe("WalletService", () => {
  let service: WalletService;
  let tracker: Tracker;
  let paystackService: PaystackService;

  beforeAll(() => {
    tracker = createTracker(dbConfig as any);
  });

  afterEach(() => {
    tracker.reset();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PaystackService,
          useValue: {
            initializeTransaction: jest.fn(),
          },
        },
        {
          provide: "default",
          useValue: dbConfig,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    paystackService = module.get<PaystackService>(PaystackService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findUserWallet", () => {
    it("should return user wallet", async () => {
      const user = {
        id: 1,
      };
      tracker.on
        .select("wallets")
        .response([{ id: 1, userId: 1, balance: 100 }]);
      const wallet = await service.findUserWallet(user as any);
      expect(wallet).toBeDefined();
      expect(wallet).toHaveProperty("id");
      expect(wallet.balance).toBe(100);
    });

    it("should return undefined if user wallet is not found", async () => {
      const user = {
        id: 1,
      };
      tracker.on.select("wallets").response([]);
      const wallet = await service.findUserWallet(user as any);
      expect(wallet).toBeUndefined();
    });
  });

  describe("fundWallet", () => {
    it("should return transaction data", async () => {
      const initializeTransactionMock = jest.fn().mockResolvedValue({
        data: {
          amount: 1000,
          reference: "random_reference",
          authorization_url: "https://random_url",
          transactionId: 1,
        },
      });
      paystackService.initializeTransaction = initializeTransactionMock;
      const user = {
        id: 1,
      };
      const wallet = {
        id: 1,
        userId: 1,
        balance: 100,
        currency: "NGN",
      };
      const payload = {
        amount: 100,
      };
      tracker.on.select("wallets").response([wallet]);
      tracker.on.insert("transactions").response([1]);
      const data = await service.fundWallet(payload as any, user as any);
      expect(data).toBeDefined();
      expect(data).toHaveProperty("reference");
      expect(data).toHaveProperty("authorization_url");
      expect(data).toHaveProperty("transactionId");
    });

    it("should transfer money from user wallet to another user wallet", async () => {
      const user = {
        id: 1,
        email: "user1@email.com",
      };
      const receiver = {
        id: 2,
        email: "user2@email.com",
      };
      const wallet = {
        id: 1,
        userId: 1,
        balance: 100,
        currency: "NGN",
      };
      const receiverWallet = {
        id: 2,
        userId: 2,
        balance: 100,
        currency: "NGN",
      };
      const payload: TransferFunds = {
        amount: 100,
        recipientEmail: "user2@email.com",
      };
      tracker.on.select("wallets").response([wallet, receiverWallet]);
      tracker.on.select("users").response([receiver, user]);
      tracker.on.insert("transactions").response([1]);
      tracker.on.update("wallets").response([1]);
      const data = await service.transferFunds(payload as any, user as any);

      expect(data).toBeDefined();
      expect(data).toHaveProperty("message");
      expect(data.message).toBe("Transfer successful");
    });

    it("should throw insufficient balance error", async () => {
      const user = {
        id: 1,
      };
      const wallet = {
        id: 1,
        userId: 1,
        balance: 100,
        currency: "NGN",
      };
      const payload: TransferFunds = {
        amount: 200,
        recipientEmail: "user2@email.com",
      };
      tracker.on.select("wallets").response([wallet]);
      await expect(
        service.transferFunds(payload as any, user as any)
      ).rejects.toThrow("Insufficient funds");
    });

    it("should throw error if recipient is not found", async () => {
      const user = {
        id: 1,
        email: "user1@email.com",
      };
      const wallet = {
        id: 1,
        userId: 1,
        balance: 100,
        currency: "NGN",
      };
      const payload: TransferFunds = {
        amount: 100,
        recipientEmail: "user2@email.com",
      };
      tracker.on.select("wallets").response([wallet]);
      tracker.on.select("users").response([]);
      await expect(
        service.transferFunds(payload as any, user as any)
      ).rejects.toThrow("Recipient not found");
    });
  });
});

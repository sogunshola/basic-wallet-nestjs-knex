import { Test, TestingModule } from "@nestjs/testing";
import { TransactionsService } from "./transactions.service";
import Knex from "knex";
import { createTracker, MockClient, Tracker } from "knex-mock-client";
import { dbConfig } from "../../config/db.config";

jest.mock("../../config/db.config", () => {
  return {
    dbConfig: Knex({ client: MockClient }),
  };
});
describe("TransactionsService", () => {
  let service: TransactionsService;
  let tracker: Tracker;

  beforeAll(() => {
    tracker = createTracker(dbConfig as any);
  });

  afterEach(() => {
    tracker.reset();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: "default",
          useValue: dbConfig,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findUserTransactions", () => {

    it("should return user transactions", async () => {
      const user = {
        id: 1,
      };
      tracker.on
        .select("transactions")
        .response([{ id: 1, userId: 1, amount: 100 }]);
      const transactions = await service.findUserTransactions({} as any, user as any);
      expect(transactions.list).toEqual([{ id: 1, userId: 1, amount: 100 }]);
      expect(transactions.pagination).toBeDefined();
      expect(transactions.pagination.currentPage).toEqual(1);
    });
  });
});

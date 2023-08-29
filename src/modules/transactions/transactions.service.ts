import { Injectable } from "@nestjs/common";
import { BaseService } from "../../shared/services/base-service.service";
import { Transaction } from "./interface/transaction.interface";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { Knex } from "knex";
import { AbstractPaginationDto } from "../../shared/dto/abstract-pagination.dto";
import { User } from "../users/interface/user.interface";

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(@InjectKnex() readonly knex: Knex) {
    super(knex, "transactions");
  }

  async findUserTransactions(pagination: AbstractPaginationDto, user: User) {
    const query = this.knex("transactions").where({
      userId: user.id,
    });

    return this.paginateItems(query, pagination);
  }
}

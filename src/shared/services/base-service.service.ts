import { NotFoundException } from "@nestjs/common";
import { Knex } from "knex";
import { CacheService } from "../../modules/cache/cache.service";
import { AbstractPaginationDto } from "../dto/abstract-pagination.dto";
import { InjectKnex, KnexPagination } from "@mithleshjs/knex-nest";
import { toCamelCase } from "../utils";

export class BaseService<T> {
  protected repository: Knex;
  constructor(
    readonly knex: Knex,
    protected modelName: string,
    protected selectFields: string[] = ["*"],
    protected cache?: CacheService
  ) {
    this.init();
  }

  async init() {
    this.repository = await this.knex(this.modelName);
  }

  async create(payload: unknown): Promise<T> {
    const data = await this.knex(this.modelName).insert(payload).returning("*");
    return data[0];
  }

  findAll(pagination: AbstractPaginationDto) {
    const query = this.knex(this.modelName).select("*");
    return this.paginateItems(query, pagination);
  }

  list(): Promise<unknown[]> {
    return this.repository.select(this.selectFields).orderBy("id", "desc");
  }

  async findOne(value: string | number, key = "id"): Promise<T> {
    const where = {};
    where[key] = value;
    const response = await this.knex(this.modelName)
      .select("*")
      .where(where)
      .first();
    if (!response) {
      throw new NotFoundException(`${this.modelName} not found`);
    }
    return response as T;
  }

  async update(id: string, payload: unknown): Promise<unknown> {
    await this.findOne(id);
    await this.knex(this.modelName).where({ id }).update(payload);
    return this.findOne(id);
  }

  async remove(id: string): Promise<Record<string, any>> {
    await this.findOne(id);
    await this.knex(this.modelName).delete(id);
    return {};
  }

  async paginateItems<T>(query: any, options: AbstractPaginationDto) {
    const { page, limit } = options;
    const result = await KnexPagination.offsetPaginate({
      query,
      perPage: limit,
      goToPage: page,
    });

    return {
      list: result.data,
      pagination: toCamelCase(result.pagination),
    };
  }
}

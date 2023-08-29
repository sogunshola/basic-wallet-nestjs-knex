import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "../../shared/services/base-service.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./interface/user.interface";
import { Knex } from "knex";
import { InjectKnex } from "@mithleshjs/knex-nest";

@Injectable()
export class UsersService extends BaseService<User> {
  // private readonly userRepo = this.knex.table('users');
  constructor(@InjectKnex() readonly knex: Knex) {
    super(knex, "users");
  }

  async checkDuplicate(user: Partial<User>) {
    const { email, phoneNumber } = user;
    const isEmailExist = await (await this.repository).where({ email }).first();
    const isTelephoneExist = await this.repository
      .where({ phoneNumber })
      .first();

    if (isEmailExist && isTelephoneExist) {
      throw new BadRequestException("Email and phone number already exists");
    }

    if (isEmailExist) {
      throw new BadRequestException("Email exists");
    }

    if (isTelephoneExist) {
      throw new BadRequestException("Phone number exists");
    }
  }

  async create(createUserDto: CreateUserDto) {
    let { password } = createUserDto;

    await this.checkDuplicate(createUserDto);

    const user = await super.create({ ...createUserDto, password });
    return user;
  }
}

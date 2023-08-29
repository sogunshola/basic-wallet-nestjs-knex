import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthPayload, LoginDto, RegisterDto } from "./auth.dto";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { Knex } from "knex";
import { Helper } from "../../shared/utils";

@Injectable()
export class AuthService {
  constructor(
    @InjectKnex() readonly knex: Knex,
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  async signUp(credentials: RegisterDto) {
    await this.usersService.checkDuplicate(credentials);
    const password = await Helper.hash(credentials.password);
    const trx = await this.knex
      .transaction((trx) => {
        return trx
          .insert({
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            email: credentials.email,
            phoneNumber: credentials.phoneNumber,
            password,
          })
          .into("users")
          .then((user) => {
            return trx
              .insert({
                currency: "NGN",
                userId: user[0],
              })
              .into("wallets")
              .then((wallet) => {
                return { user: user[0], wallet: wallet[0] };
              });
          });
      })
      .catch((error) => {
        throw error;
      });
    const payload: AuthPayload = { id: trx.user };
    const token = this.jwtService.sign(payload);
    const user = await this.usersService.findOne(trx.user);
    delete user.password;
    return { user, token };
  }

  async signIn(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.usersService.findOne(email, "email");
      if (user && (await Helper.compare(password, user.password))) {
        delete user.password;
        const payload: AuthPayload = { id: user.id };
        const token = this.jwtService.sign(payload);
        return { user, token };
      }
      throw new UnauthorizedException("Invalid Credentials");
    } catch (error) {
      throw error;
      throw new UnauthorizedException("Invalid Credentials");
    }
  }
}

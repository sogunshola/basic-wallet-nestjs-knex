import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import * as dotenv from "dotenv";
import { User } from "../users/interface/user.interface";
import { AuthPayload } from "./auth.dto";
import env from "../../config/env.config";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { Knex } from "knex";

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectKnex() readonly knex: Knex) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
      secretOrKey: env.jwtSecret,
    });
  }

  async validate(payload: AuthPayload) {
    const { id } = payload;
    // console.log('hello');
    const user = await this.knex("users")
      .where({ id })
      .with("wallet", (builder) => {
        builder.select("id", "balance", "currency");
      })
      .first();
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

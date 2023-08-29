import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../users/interface/user.interface";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";

import * as dotenv from "dotenv";
import env from "../../config/env.config";
import { UsersModule } from "../users/users.module";

dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      secret: env.jwtSecret,
      signOptions: {
        expiresIn: env.expiresIn,
      },
    }),
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy, JwtModule],
})
export class AuthModule {}

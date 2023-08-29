import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { dbConfig } from "./config/db.config";
import { EmailsModule } from "./shared/alerts/emails/emails.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import env from "./config/env.config";
import { MailerModule } from "@nestjs-modules/mailer";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";
import { BullModule } from "@nestjs/bull";
// import { WebsocketModule } from "./websockets/websocket.module";
import { GlobalModule } from "./global.module";
import { KnexModule } from "@mithleshjs/knex-nest";
import { WalletModule } from "./modules/wallet/wallet.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { TransactionsModule } from './modules/transactions/transactions.module';
const mg = require("nodemailer-mailgun-transport");

@Module({
  imports: [
    GlobalModule,
    EventEmitterModule.forRoot(),
    KnexModule.registerAsync({
      useFactory: () => dbConfig,
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: mg({
        auth: {
          api_key: env.mailgunApiKey,
          domain: env.mailgunDomain,
        },
      }),
      template: {
        dir: __dirname + "/templates",
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BullModule.forRoot({}),

    AuthModule,
    EmailsModule,
    WalletModule,
    WebhooksModule,
    TransactionsModule,
    // WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

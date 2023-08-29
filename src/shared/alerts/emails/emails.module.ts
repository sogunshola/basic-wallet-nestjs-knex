import { Module } from "@nestjs/common";
import { EmailsService } from "./emails.service";
// import { EmailsController } from './emails.controller';
import { EmailEntity } from "./entities/email.entity";
import { EmailsConsumer } from "./email.consumer";
import { BullModule } from "@nestjs/bull";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "emailQueue",
    }),
  ],
  // controllers: [EmailsController],
  providers: [EmailsService, EmailsConsumer],
})
export class EmailsModule {}

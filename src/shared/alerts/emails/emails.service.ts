import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bull";
import { AppEvents } from "../../../constants";
import { BaseService } from "../../services/base-service.service";
import { CreateEmailDto } from "./dto/create-email.dto";
import { EmailEntity } from "./entities/email.entity";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { Knex } from "knex";

@Injectable()
export class EmailsService extends BaseService<EmailEntity> {
  constructor(
    @InjectKnex() readonly knex: Knex,
    private readonly mailerService: MailerService,
    @InjectQueue("emailQueue") private readonly emailQueue: Queue
  ) {
    super(knex, "emails");
  }

  @OnEvent(AppEvents.SEND_EMAIl)
  async createEmail(createEmailDto: CreateEmailDto) {
    console.log(createEmailDto);
    const email = await this.create(createEmailDto);
    console.log("email sent to queue");
    this.emailQueue.add(email, {
      attempts: 5,
      delay: 3000,
    });

    return email;
  }

  sendEmail(options: ISendMailOptions) {
    return this.mailerService.sendMail(options);
  }
}

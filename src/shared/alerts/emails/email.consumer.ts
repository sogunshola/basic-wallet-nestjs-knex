import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { EmailsService } from "./emails.service";
import { EmailEntity } from "./entities/email.entity";
import { InjectKnex } from "@mithleshjs/knex-nest";
import { Knex } from "knex";

@Processor("emailQueue")
export class EmailsConsumer {
  constructor(
    @InjectKnex() readonly knex: Knex,
    private readonly emailService: EmailsService
  ) {}

  @Process()
  async sendMail(job: Job<EmailEntity>) {
    try {
      const {
        subject,
        metaData,
        receiverEmail,
        senderEmail,
        template,
        id,
        replyTo,
        attachments,
      } = job.data;

      console.log({ jobdata: job.data });

      this.emailService
        .sendEmail({
          template,
          to: receiverEmail,
          from: senderEmail,
          subject,
          replyTo,
          attachments,
          context: { ...metaData },
          // context: { ...metaData, moneyFormat: Helper.moneyFormat },
        })
        .then(
          async () =>
            await this.knex("emails").where({ id }).update({ delivered: true })
        )
        .catch(async (emailError) => {
          console.log({ emailError });
          await this.knex("emails").where({ id }).update({ delivered: false });
        });
    } catch (error) {
      console.log({ processerror: error });
    }
  }
}

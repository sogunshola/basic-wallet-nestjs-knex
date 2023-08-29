export class EmailEntity {
  id: number;
  template: string;

  metaData: any;

  receiverEmail: string;

  senderEmail: string;

  replyTo: string;

  subject: string;

  delivered: boolean;

  error: string;

  attachments: {
    filename: string;
    content?: any;
    path?: string;
    contentType?: string;
    cid?: string;
  }[];
}

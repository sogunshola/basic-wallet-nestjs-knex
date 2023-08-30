import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: 'Health check',
      data: {
        status: 'OK',
        date: Date.now(),
      },
    };
  }
}

import { Controller, Post, Body, Headers } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { resolveResponse } from "../../shared/resolvers";
import { ApiTags } from "@nestjs/swagger";
import { WebhookDto } from "./dto/interface";

@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("paystack")
  handlePaystackWebhook(
    @Body() paystackResponse: WebhookDto<unknown>,
    @Headers() headers: unknown
  ) {
    return resolveResponse(
      this.webhooksService.handlePaystackWebhook(paystackResponse, headers)
    );
  }
}

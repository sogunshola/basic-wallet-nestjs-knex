import { IsNotEmpty } from "class-validator";

export class WebhookDto<T> {
  @IsNotEmpty()
  event: string;

  @IsNotEmpty()
  data: T;
}

export enum ShupbubbleWebhookEvents {
  SHIPMENT_CREATED = "shipment.label.created",
  SHIPMENT_STATUS_CHANGED = "shipment.status.changed",
  SHIPMENT_CANCELLED = "shipment.cancelled",
}

export enum PaystackEvents {
  CHARGE_SUCCESS = "charge.success",
  TRANSFER_SUCCESS = "transfer.success",
  TRANSFER_FAILED = "transfer.failed",
  TRANSFER_REVERSED = "transfer.reversed",
}

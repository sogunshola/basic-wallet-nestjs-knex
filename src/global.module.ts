import { Global, Module } from "@nestjs/common";
import { RequestController } from "./core";

@Global()
@Module({
  imports: [],
  providers: [RequestController],
  exports: [RequestController],
})
export class GlobalModule {}

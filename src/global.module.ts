import { Global, Module } from "@nestjs/common";
import { RequestController } from "./core";
import { CacheService } from "./modules/cache/cache.service";

@Global()
@Module({
  imports: [],
  providers: [CacheService, RequestController],
  exports: [CacheService, RequestController],
})
export class GlobalModule {}

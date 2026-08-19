import { Module } from "@nestjs/common";
import { EnvModule } from "./config/env.module";
import { HealthModule } from "./health/health.module";

// Domain modules (auth, tenancy, scheduling, orders, …) are added in the
// phase that implements them — no empty scaffolding (PRODUCTION_ROADMAP.md).
@Module({
  imports: [EnvModule, HealthModule],
})
export class AppModule {}

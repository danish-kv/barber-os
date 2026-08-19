import { Controller, Get, Inject } from "@nestjs/common";
import type { HealthResponse } from "@barbershop-os/contracts";
import type { Env } from "../config/env";
import { ENV } from "../config/env.module";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../../package.json") as { version: string };

@Controller("health")
export class HealthController {
  constructor(@Inject(ENV) private readonly env: Env) {}

  @Get()
  health(): HealthResponse {
    return {
      status: "ok",
      service: "api",
      env: this.env.NODE_ENV,
      version: pkg.version,
    };
  }
}

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import helmet from "@fastify/helmet";
import type { IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { loadEnv } from "./config/env";

async function bootstrap() {
  const env = loadEnv();

  const adapter = new FastifyAdapter({
    // Structured pino logging with request ids and PII redaction.
    logger: {
      level: env.LOG_LEVEL,
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "*.phone",
          "*.otp",
          "*.token",
        ],
        censor: "[redacted]",
      },
    },
    // Honor an upstream request id (Vercel/Fly proxies) or mint one.
    genReqId: (req: IncomingMessage) =>
      (req.headers["x-request-id"] as string | undefined) ?? randomUUID(),
    // Fly/Vercel sit in front of us.
    trustProxy: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      // RAW BODY (Phase 5+ requirement, decided now — API_DESIGN.md §3.7):
      // payment/WhatsApp webhooks must verify provider signatures against the
      // exact raw bytes. Nest's rawBody option keeps `request.rawBody`
      // available on routes that opt in via RawBodyRequest, so enabling it
      // here means webhook handlers later need zero bootstrap changes.
      rawBody: true,
      bufferLogs: true,
    }
  );

  await app.register(helmet, {
    // API serves JSON only; CSP belongs to the web app.
    contentSecurityPolicy: false,
  });

  app.enableCors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : false,
    credentials: true,
  });

  // Echo the request id so clients/logs can be correlated end to end.
  adapter
    .getInstance()
    .addHook("onSend", async (request, reply) => {
      void reply.header("x-request-id", request.id);
    });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix("v1");

  // Graceful shutdown: Nest listens for SIGTERM/SIGINT and closes Fastify
  // (in-flight requests drain) before the process exits — required for
  // zero-downtime deploys on Fly.
  app.enableShutdownHooks();

  await app.listen({ port: env.PORT, host: env.HOST });
}

void bootstrap();

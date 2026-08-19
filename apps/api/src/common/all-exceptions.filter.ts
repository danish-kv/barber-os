import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { errorEnvelope } from "@barbershop-os/contracts";

/** Every error leaves the API in the single envelope shape from
 * @barbershop-os/contracts (API_DESIGN.md §1), tagged with the request id.
 * Internal messages are never leaked on 5xx. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const requestId = request.id as string;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const body =
        typeof res === "object" && res !== null && "code" in res
          ? errorEnvelope(
              String((res as Record<string, unknown>).code),
              String(
                (res as Record<string, unknown>).message ?? exception.message
              ),
              (res as Record<string, unknown>).details as
                | Record<string, unknown>
                | undefined,
              requestId
            )
          : errorEnvelope(
              httpCode(status),
              exception.message,
              undefined,
              requestId
            );
      void reply.status(status).send(body);
      return;
    }

    request.log.error({ err: exception }, "unhandled exception");
    void reply
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(
        errorEnvelope(
          "internal_error",
          "Something went wrong.",
          undefined,
          requestId
        )
      );
  }
}

function httpCode(status: number): string {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthenticated";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "unprocessable";
    case 429:
      return "rate_limited";
    default:
      return `http_${status}`;
  }
}

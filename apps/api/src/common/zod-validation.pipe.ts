import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

/** Foundation validation pattern: every route with input declares a zod
 * schema from @barbershop-os/contracts and applies this pipe. Unknown keys
 * are stripped by the schemas themselves. */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: "validation_failed",
        message: "Request validation failed.",
        details: {
          issues: result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      });
    }
    return result.data;
  }
}

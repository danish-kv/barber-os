import { z } from "zod";

/** The single error envelope every API error uses (API_DESIGN.md §1).
 * `code` values are stable, machine-readable strings. */
export const ErrorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    requestId: z.string().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelope>;

export function errorEnvelope(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): ErrorEnvelope {
  return { error: { code, message, ...(details && { details }), ...(requestId && { requestId }) } };
}

import { z } from "zod";

export const HealthResponse = z.object({
  status: z.literal("ok"),
  service: z.literal("api"),
  env: z.enum(["local", "test", "staging", "production"]),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

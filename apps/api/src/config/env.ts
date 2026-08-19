import { z } from "zod";

// Typed environment configuration, validated once at startup. Only variables
// the current phase actually uses are declared — add per phase, never
// speculatively. No product/brand domains are hard-coded anywhere
// (SECURITY_AND_TENANCY.md / naming rules).

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["local", "test", "staging", "production"])
      .default("local"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    HOST: z.string().default("0.0.0.0"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    /** Comma-separated list of allowed browser origins. */
    CORS_ORIGINS: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // Staging/production must be explicit about who may call from a browser.
    if (
      (env.NODE_ENV === "production" || env.NODE_ENV === "staging") &&
      !env.CORS_ORIGINS
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGINS"],
        message: `CORS_ORIGINS is required when NODE_ENV=${env.NODE_ENV}`,
      });
    }
  });

export type Env = z.infer<typeof EnvSchema> & { corsOrigins: string[] };

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  const env = parsed.data;
  return {
    ...env,
    corsOrigins: env.CORS_ORIGINS
      ? env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env";

describe("loadEnv", () => {
  it("applies safe local defaults", () => {
    const env = loadEnv({} as NodeJS.ProcessEnv);
    expect(env.NODE_ENV).toBe("local");
    expect(env.PORT).toBe(4000);
    expect(env.corsOrigins).toEqual([]);
  });

  it("parses CORS_ORIGINS csv", () => {
    const env = loadEnv({ CORS_ORIGINS: "https://a.example, https://b.example" } as NodeJS.ProcessEnv);
    expect(env.corsOrigins).toEqual(["https://a.example", "https://b.example"]);
  });
});

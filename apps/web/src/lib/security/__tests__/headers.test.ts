import { afterEach, describe, expect, it, vi } from "vitest";

import { applySecurityHeaders } from "../headers";

vi.mock(import("@repo/config/env/web-client"), () => ({
  clientEnv: {
    VITE_CONVEX_URL: "https://example.convex.cloud",
    VITE_WORKOS_REDIRECT_URI: "https://example.com/api/auth/callback",
  },
}));

describe(applySecurityHeaders, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("adds production browser protections to secure responses", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = applySecurityHeaders(
      new Response("ok"),
      new Request("https://example.com")
    );

    const contentSecurityPolicy = response.headers.get(
      "Content-Security-Policy"
    );
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain(
      "img-src 'self' data: blob: https://workoscdn.com https://example.convex.cloud"
    );
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains"
    );
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    await expect(response.text()).resolves.toBe("ok");
  });

  it("keeps local HTTP responses free of production-only headers", () => {
    vi.stubEnv("NODE_ENV", "test");

    const response = applySecurityHeaders(
      new Response(),
      new Request("http://localhost")
    );

    expect(response.headers.get("Content-Security-Policy")).toBeNull();
    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
  });
});

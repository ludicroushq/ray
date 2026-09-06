import { beforeEach, describe, expect, test, vi } from "vitest";

import { captureServerException } from "../posthog.server";

const { constructorFailure, posthog, postHogConstructor, serverEnv } =
  vi.hoisted(() => {
    const posthogClient = {
      captureExceptionImmediate:
        vi.fn<
          (
            error: unknown,
            distinctId: string | undefined,
            properties: Record<string, unknown>
          ) => Promise<void>
        >(),
      shutdown: vi.fn<() => Promise<void>>(),
    };

    function makePostHog(
      _apiKey: string,
      _options: { flushAt: number; flushInterval: number }
    ) {
      if (constructorError.value) {
        throw constructorError.value;
      }

      return posthogClient;
    }

    const constructorError = { value: null as Error | null };

    return {
      constructorFailure: constructorError,
      postHogConstructor: vi.fn<typeof makePostHog>(makePostHog),
      posthog: posthogClient,
      serverEnv: {
        CONVEX_DEPLOYMENT: "test",
        POSTHOG_API_KEY: "phc_test" as string | null,
        WORKOS_API_KEY: "test",
        WORKOS_CLIENT_ID: "test",
        WORKOS_COOKIE_PASSWORD: "x".repeat(32),
        WORKOS_REDIRECT_URI: "https://example.com/callback",
      },
    };
  });

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock("@repo/config/env/server", () => ({ serverEnv }));

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock("posthog-node", () => ({ PostHog: postHogConstructor }));

describe(captureServerException, () => {
  beforeEach(() => {
    constructorFailure.value = null;
    serverEnv.POSTHOG_API_KEY = "phc_test";
    postHogConstructor.mockClear();
    posthog.captureExceptionImmediate.mockReset();
    posthog.shutdown.mockReset();
    posthog.captureExceptionImmediate.mockResolvedValue();
    posthog.shutdown.mockResolvedValue();
  });

  test("does nothing when the API key is missing", async () => {
    serverEnv.POSTHOG_API_KEY = null;

    await captureServerException(new Error("boom"), { pathname: "/app" });

    expect(postHogConstructor).not.toHaveBeenCalled();
  });

  test("captures the exception and shuts down the client", async () => {
    const error = new Error("boom");
    const properties = { method: "GET", pathname: "/app" };

    await captureServerException(error, properties);

    expect(posthog.captureExceptionImmediate.mock.calls[0]?.[0]).toBe(error);
    expect(posthog.captureExceptionImmediate.mock.calls[0]?.[2]).toBe(
      properties
    );
    expect(posthog.shutdown).toHaveBeenCalledOnce();
  });

  test("shuts down after capture rejects", async () => {
    posthog.captureExceptionImmediate.mockRejectedValueOnce(
      new Error("capture failed")
    );

    await expect(
      captureServerException(new Error("boom"), { pathname: "/app" })
    ).resolves.toBeUndefined();
    expect(posthog.shutdown).toHaveBeenCalledOnce();
  });

  test("settles when shutdown rejects", async () => {
    posthog.shutdown.mockRejectedValueOnce(new Error("shutdown failed"));

    await expect(
      captureServerException(new Error("boom"), { pathname: "/app" })
    ).resolves.toBeUndefined();
  });

  test("preserves construction defects without attempting shutdown", async () => {
    constructorFailure.value = new Error("construction failed");

    await expect(
      captureServerException(new Error("boom"), { pathname: "/app" })
    ).rejects.toThrow("construction failed");
    expect(posthog.shutdown).not.toHaveBeenCalled();
  });

  test("settles when capture and shutdown both reject", async () => {
    posthog.captureExceptionImmediate.mockRejectedValueOnce(
      new Error("capture failed")
    );
    posthog.shutdown.mockRejectedValueOnce(new Error("shutdown failed"));

    await expect(
      captureServerException(new Error("boom"), { pathname: "/app" })
    ).resolves.toBeUndefined();
    expect(posthog.shutdown).toHaveBeenCalledOnce();
  });
});

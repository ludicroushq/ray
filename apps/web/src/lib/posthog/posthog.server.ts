import { getServerEnv } from "@repo/config/env/web-server";
import { PostHog } from "posthog-node";

export async function captureServerException(
  error: unknown,
  properties: Record<string, unknown>
) {
  const { POSTHOG_API_KEY } = getServerEnv();

  if (!POSTHOG_API_KEY) {
    return;
  }

  const posthog = new PostHog(POSTHOG_API_KEY, {
    flushAt: 1,
    flushInterval: 0,
  });

  try {
    await posthog.captureExceptionImmediate(error, undefined, properties);
  } finally {
    await posthog.shutdown();
  }
}

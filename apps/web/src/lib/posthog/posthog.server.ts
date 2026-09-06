import { serverEnv } from "@repo/config/env/server";
import { runEffect } from "@repo/effect/runtime";
import { Data, Effect } from "effect";
import { PostHog } from "posthog-node";

const PostHogCaptureError = Data.TaggedError("PostHogCaptureError")<{
  cause: unknown;
}>;
const PostHogShutdownError = Data.TaggedError("PostHogShutdownError")<{
  cause: unknown;
}>;

function captureServerExceptionEffect(options: {
  apiKey: string;
  error: unknown;
  properties: Record<string, unknown>;
}) {
  const { apiKey, error, properties } = options;

  return Effect.scoped(
    Effect.gen(function* captureException() {
      const posthog = yield* Effect.acquireRelease(
        Effect.sync(
          () => new PostHog(apiKey, { flushAt: 1, flushInterval: 0 })
        ),
        (client) =>
          Effect.tryPromise({
            catch: (cause) => new PostHogShutdownError({ cause }),
            try: () => client.shutdown(),
          }).pipe(
            // Telemetry cleanup is best effort; it must not mask the app error.
            Effect.catchTag("PostHogShutdownError", () => Effect.void)
          )
      );

      yield* Effect.tryPromise({
        catch: (cause) => new PostHogCaptureError({ cause }),
        try: () =>
          posthog.captureExceptionImmediate(error, undefined, properties),
      });
    })
  );
}

export async function captureServerException(
  error: unknown,
  properties: Record<string, unknown>
) {
  const apiKey = serverEnv.POSTHOG_API_KEY;

  if (!apiKey) {
    return;
  }

  await runEffect({
    effect: captureServerExceptionEffect({ apiKey, error, properties }).pipe(
      // Reporting a failure must not prevent the original error from surfacing.
      Effect.catchTag("PostHogCaptureError", () => Effect.void)
    ),
  });
}

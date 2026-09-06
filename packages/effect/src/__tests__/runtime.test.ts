import { Context, Data, Deferred, Effect } from "effect";
import { describe, expect, expectTypeOf, test, vi } from "vitest";

import { runEffect } from "../runtime";

const UpstreamUnavailable = Data.TaggedError("UpstreamUnavailable")<{
  message: string;
}>;
const MessageSource = Context.GenericTag<{
  read: Effect.Effect<string, InstanceType<typeof UpstreamUnavailable>>;
}>("test/MessageSource");

describe(runEffect, () => {
  test("executes a service after dependencies and expected failures are resolved", async () => {
    const program = Effect.gen(function* readMessage() {
      const source = yield* MessageSource;
      return yield* source.read;
    }).pipe(
      Effect.provideService(MessageSource, {
        read: Effect.fail(
          new UpstreamUnavailable({ message: "Service unavailable" })
        ),
      }),
      Effect.catchTag("UpstreamUnavailable", () => Effect.succeed("Try again"))
    );

    await expect(runEffect({ effect: program })).resolves.toBe("Try again");
  });

  test("releases acquired resources when the caller aborts", async () => {
    const controller = new AbortController();
    const acquired = Effect.runSync(Deferred.make<boolean>());
    const release = vi.fn<() => void>();
    const program = Effect.scoped(
      Effect.gen(function* waitWithResource() {
        yield* Effect.acquireRelease(Effect.void, () => Effect.sync(release));
        yield* Deferred.succeed(acquired, true);
        return yield* Effect.never;
      })
    );
    const result = runEffect({ effect: program, signal: controller.signal });
    await runEffect({ effect: Deferred.await(acquired) });
    controller.abort();

    await expect(result).rejects.toBeInstanceOf(Error);
    expect(release).toHaveBeenCalledOnce();
  });

  test("preserves defects as rejected promises", async () => {
    await expect(
      runEffect({ effect: Effect.die(new Error("Unexpected failure")) })
    ).rejects.toThrow("Unexpected failure");
  });

  test("requires an empty expected-error and dependency channel", () => {
    type Runnable = Parameters<typeof runEffect>[0]["effect"];

    expectTypeOf<Effect.Effect<string>>().toExtend<Runnable>();
    expectTypeOf<
      Effect.Effect<string, InstanceType<typeof UpstreamUnavailable>>
    >().not.toExtend<Runnable>();
    expectTypeOf<
      Effect.Effect<string, never, Context.Tag.Identifier<typeof MessageSource>>
    >().not.toExtend<Runnable>();
  });
});

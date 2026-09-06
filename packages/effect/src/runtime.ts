import { Effect } from "effect";

type RunEffectOptions<A> = {
  effect: Effect.Effect<A, never, never>;
  signal?: AbortSignal;
};

/**
 * The Promise boundary for application services. Resolve expected errors and
 * provide dependencies before execution. Defects still reject the Promise.
 * Confect owns execution inside its generated Convex function adapters.
 */
export function runEffect<A>(options: RunEffectOptions<A>): Promise<A> {
  const { effect, signal } = options;
  return Effect.runPromise(effect, { signal });
}

import { Auth } from "@confect/server/Auth";
import type { UserIdentity } from "convex/server";
import { catchTag, fail, flatMap, gen } from "effect/Effect";
import type { Effect as EffectType } from "effect/Effect";

import { Unauthenticated } from "./errors/authentication";

export const requireIdentity = gen(function* requireIdentityEffect() {
  const auth = yield* Auth;

  return yield* auth.getUserIdentity.pipe(
    catchTag("NoUserIdentityFoundError", () =>
      fail(
        new Unauthenticated({
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        })
      )
    )
  );
});

// Confect 9 has no group middleware; authenticated handlers opt into this request-scoped helper.
export function withAuthenticatedIdentity<A, E, R>(opts: {
  handler: (identity: UserIdentity) => EffectType<A, E, R>;
}): EffectType<A, E | Unauthenticated, R | Auth> {
  return requireIdentity.pipe(flatMap(opts.handler));
}

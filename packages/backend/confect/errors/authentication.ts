// oxlint-disable-next-line sonarjs/no-wildcard-import
import * as Schema from "effect/Schema";

// oxlint-disable-next-line unicorn/throw-new-error
export class Unauthenticated extends Schema.TaggedError<Unauthenticated>()(
  "Unauthenticated",
  {
    code: Schema.Literal("UNAUTHENTICATED"),
    message: Schema.Literal("Authentication required"),
  }
) {}

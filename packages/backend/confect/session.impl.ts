import { make as makeFunction } from "@confect/server/FunctionImpl";
import { finalize, make as makeGroup } from "@confect/server/GroupImpl";
import { succeed } from "effect/Effect";
import { provide } from "effect/Layer";

import schema from "./_generated/schema";
import { withAuthenticatedIdentity } from "./identity";
import session from "./session.spec";

const currentViewer = makeFunction(schema, session, "currentViewer", () =>
  withAuthenticatedIdentity({
    handler: (identity) =>
      succeed({
        email: identity.email ?? null,
        name: identity.name ?? null,
        tokenIdentifier: identity.tokenIdentifier,
      }),
  })
);

export default finalize(
  makeGroup(schema, session).pipe(provide(currentViewer))
);

import { publicQuery } from "@confect/core/FunctionSpec";
import { make as makeGroup } from "@confect/core/GroupSpec";
import { NullOr, String as SchemaString, Struct } from "effect/Schema";

import { Unauthenticated } from "./errors/authentication";

const Viewer = Struct({
  email: NullOr(SchemaString),
  name: NullOr(SchemaString),
  tokenIdentifier: SchemaString,
});

export const currentViewer = publicQuery({
  args: () => Struct({}),
  error: () => Unauthenticated,
  name: "currentViewer",
  returns: () => Viewer,
});

export default makeGroup().addFunction(currentViewer);

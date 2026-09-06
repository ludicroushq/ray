import { GroupSpec, Spec } from "@confect/core";
import session from "../session.spec";

const spec: Spec.Spec<
  | GroupSpec.NamedAt<typeof session, "session">
> = Spec.make().addAt("session", session);

export default spec;

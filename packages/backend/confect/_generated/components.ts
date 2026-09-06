import { componentsGeneric } from "convex/server";

export type Components = {
  "migrations": import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  "posthog": import("@posthog/convex/_generated/component.js").ComponentApi<"posthog">;
  "workflow": import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};

export const components: Components = componentsGeneric() as any;

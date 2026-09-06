import type { ApiFromModules } from "convex/server";
import { makeFunctionReference } from "convex/server";

import type { currentViewer as registeredCurrentViewer } from "./convex/session";

type NativeApi = ApiFromModules<{
  session: { currentViewer: typeof registeredCurrentViewer };
}>;

// Derive the encoded wire contract from Confect's generated Convex adapter.
// A native reference keeps server code and Confect's schema graph off the client.
// Tests verify the name against Confect refs after codegen.
// Native clients receive wire values and ConvexError, not decoded Effect values.
export const currentViewer: NativeApi["session"]["currentViewer"] =
  makeFunctionReference("session:currentViewer");

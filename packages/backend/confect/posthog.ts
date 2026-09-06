import { PostHog } from "@posthog/convex";
import type { Auth } from "convex/server";

import { env } from "../convex/_generated/server";
import { components } from "./_generated/components";

type IdentifyContext = {
  auth: Auth;
};

async function identifyFromConvexAuth(ctx: IdentifyContext) {
  const { auth } = ctx;
  const identity = await auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return {
    // Match the WorkOS user ID used by the browser's PostHog identity.
    distinctId: identity.subject,
  };
}

const apiKey = env.POSTHOG_API_KEY ?? "";

function discardPostHogEvent() {
  return null;
}

export const posthog = new PostHog(components.posthog, {
  apiKey,
  beforeSend: apiKey ? undefined : discardPostHogEvent,
  identify: identifyFromConvexAuth,
});

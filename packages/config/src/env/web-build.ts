import { createEnv } from "@t3-oss/env-core";

import { OPTIONAL_STRING } from "./schemas.ts";

export function getWebBuildEnv(runtimeEnv: Record<string, string | undefined>) {
  const env = createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv,
    server: {
      POSTHOG_PERSONAL_API_KEY: OPTIONAL_STRING,
      POSTHOG_PROJECT_ID: OPTIONAL_STRING,
    },
  });

  const hasPersonalApiKey = Boolean(env.POSTHOG_PERSONAL_API_KEY);
  const hasProjectId = Boolean(env.POSTHOG_PROJECT_ID);

  if (hasPersonalApiKey !== hasProjectId) {
    throw new Error(
      "POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID must be set together"
    );
  }

  return env;
}

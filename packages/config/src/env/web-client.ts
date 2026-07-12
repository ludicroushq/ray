import { createEnv } from "@t3-oss/env-core";

import { OPTIONAL_STRING, REQUIRED_URL } from "./schemas";

export const clientEnv = createEnv({
  client: {
    VITE_CONVEX_URL: REQUIRED_URL,
    VITE_POSTHOG_KEY: OPTIONAL_STRING,
    VITE_WORKOS_REDIRECT_URI: REQUIRED_URL,
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  runtimeEnv: import.meta.env,
});

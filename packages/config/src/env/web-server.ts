import { createEnv } from "@t3-oss/env-core";
import { string } from "zod";

import { OPTIONAL_STRING, REQUIRED_STRING } from "./schemas";

export function getServerEnv() {
  return createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv: process.env,
    server: {
      POSTHOG_API_KEY: OPTIONAL_STRING,
      WORKOS_API_KEY: REQUIRED_STRING,
      WORKOS_CLIENT_ID: REQUIRED_STRING,
      WORKOS_COOKIE_PASSWORD: string().min(32),
    },
  });
}

import migrations from "@convex-dev/migrations/convex.config.js";
import workflow from "@convex-dev/workflow/convex.config.js";
import posthog from "@posthog/convex/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    WORKOS_CLIENT_ID: v.string(),
  },
});

app.use(migrations);
app.use(posthog);
app.use(workflow);

export default app;

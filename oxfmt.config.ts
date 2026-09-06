import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "**/.agents/skills/**",
    "**/.claude/skills/**",
    "**/.cursor/skills/**",
    "**/.ruler/skills/**",
    "packages/backend/confect/_generated/**",
    "packages/backend/convex/**",
    "!packages/backend/convex/",
    "!packages/backend/convex/convex.config.ts",
    "!packages/backend/convex/tsconfig.json",
  ],
});

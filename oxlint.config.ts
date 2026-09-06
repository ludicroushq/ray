import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import jsPlugins from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";

const effectRuntimeRunners = [
  "runCallback",
  "runFork",
  "runPromise",
  "runPromiseExit",
  "runSync",
  "runSyncExit",
];
const effectRuntimeMessage =
  "Run Effect programs through @repo/effect/runtime at an application boundary.";

export default defineConfig({
  extends: [core, jsPlugins, tanstack, vitest, react],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
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
  overrides: [
    {
      files: ["apps/web/src/routes/**/*.{ts,tsx}"],
      rules: {
        "sort-keys": "off",
      },
    },
    {
      files: ["packages/backend/confect/**/*.spec.ts"],
      plugins: ["vitest"],
      rules: {
        "sonarjs/no-empty-test-file": "off",
        "vitest/consistent-test-filename": "off",
      },
    },
    {
      excludeFiles: [
        "**/*.test.{js,jsx,ts,tsx}",
        "**/__tests__/**",
        "packages/backend/confect/_generated/**",
        "packages/effect/src/runtime.ts",
      ],
      files: ["**/*.{js,jsx,ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                importNames: effectRuntimeRunners,
                message: effectRuntimeMessage,
                name: "effect",
              },
              {
                importNames: effectRuntimeRunners,
                message: effectRuntimeMessage,
                name: "effect/Effect",
              },
            ],
          },
        ],
        "no-restricted-properties": [
          "error",
          ...effectRuntimeRunners.map((property) => ({
            message: effectRuntimeMessage,
            object: "Effect",
            property,
          })),
        ],
      },
    },
  ],
  rules: {
    "func-style": "off",
    "github/filenames-match-regex": "off",
    "no-restricted-imports": "off",
    "no-restricted-properties": "off",
    "no-use-before-define": "off",
    "node/callback-return": "off",
    "react-doctor/nextjs-no-a-element": "off",
    "typescript/consistent-type-definitions": ["error", "type"],
  },
});

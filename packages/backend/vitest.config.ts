import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    // Confect's *.spec.ts files are contracts, not Vitest suites.
    include: ["test/**/*.test.ts"],
  },
});

import { fileURLToPath } from "node:url";

import posthog from "@posthog/rollup-plugin";
import { getWebBuildEnv } from "@repo/config/env/web-build";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import type { PluginOption } from "vite";

const envDir = fileURLToPath(new URL("../..", import.meta.url));

const config = defineConfig(({ mode }) => {
  const buildEnv = getWebBuildEnv(loadEnv(mode, envDir, ""));
  const plugins: PluginOption[] = [
    devtools({
      injectSource: {
        enabled: false,
      },
    }),
    tanstackStart(),
    nitro(),
    viteReact(),
    tailwindcss(),
  ];

  if (buildEnv.POSTHOG_PERSONAL_API_KEY && buildEnv.POSTHOG_PROJECT_ID) {
    plugins.push(
      posthog({
        personalApiKey: buildEnv.POSTHOG_PERSONAL_API_KEY,
        projectId: buildEnv.POSTHOG_PROJECT_ID,
        sourcemaps: {
          deleteAfterUpload: true,
          enabled: true,
        },
      })
    );
  }

  return {
    envDir,
    plugins,
    resolve: {
      tsconfigPaths: true,
    },
  };
});

export default config;

# Project Instructions

- Do not run dev servers or database-altering CLIs without explicit user permission. Complete static work first, then tell the user which interactive commands remain.
- Treat this repository as a reusable app starter. Keep applications unscoped, reserve `@repo/*` for internal packages, put shared app and environment configuration in `@repo/config`, and keep Convex source in `packages/backend/convex`.
- Run Convex CLI commands from the repository root, which owns `convex.json`, `.env.local`, and AI skills. Keep functions in `packages/backend/convex` and read `packages/backend/convex/_generated/ai/guidelines.md` before changing them.
- Preserve the `TODO`/`TOD` placeholder naming unless the user asks to change it. Keep checked-in local-environment setup account-agnostic; do not add Vercel links, environment pulls, or other personal setup.
- For WorkOS AuthKit, keep sign-in and sign-up distinct, redirect login to `/app` and logout to `/`, and use the public portless URL for local callbacks. Configure server-side AuthKit with `VITE_WORKOS_REDIRECT_URI`, and use the client `signOut()` flow for browser-initiated logout.
- Put values shared by browser and server code in `@repo/config/env/web-client` with a `VITE_` name. Use the canonical `appUrl` unless the browser genuinely needs a runtime environment value.
- In a custom TanStack Start `src/start.ts`, keep same-origin CSRF validation before authentication middleware. Do not set the router's global `defaultPendingMs` to `0`, which can replace server-rendered HTML during hydration.
- Use `convex-route-query` for Convex route loaders and React queries. Do not enable global `expectAuth` while public routes can subscribe logged out; enforce private access in protected layouts and Convex functions.
- Use PostHog SDKs directly and keep their established environment variable names. Send Convex logs and errors through dashboard integrations; use `@posthog/convex` for backend events and flags, and keep build credentials separate from runtime project tokens.
- Keep Migrations and Workflow registered as starter defaults. Workpool is Workflow's peer and should only be mounted separately for an independent pool; add other Convex components only for concrete product needs.
- Define queries, mutations, and actions through the shared Fluent Convex builder and authenticated chains. Use native Convex entry points for schemas, HTTP endpoints, crons, and component configuration.
- Use FormAdapter for straightforward web forms. Keep `DaisyUIProvider` at the app root, create provider-neutral forms from `@formadapter/react`, submit to Convex through ordinary `onSubmit` handlers, and add `@formadapter/tanstack-start` only for TanStack Start server functions.
- Keep at least one representative starter test, with component tests under `__tests__`. Do not invent backend behavior solely for a sample test.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `packages/backend/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->

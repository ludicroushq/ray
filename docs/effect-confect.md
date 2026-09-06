# Effect and Confect application foundation

This starter uses Effect 3.22.1 and Confect 9.4.2. These are a compatible stable pair. Confect is a community-maintained integration, not an official Convex or Effect SDK. Upgrade the pinned pair together after checking peer dependencies, regeneration, typechecks, and focused tests; the Effect 4 / Confect 10 prerelease APIs are different.

Effect is the default for substantial application logic: composed external calls, typed business failures, dependency injection, cancellation, and resource lifetimes. React rendering, TanStack handlers, WorkOS authentication, and straightforward forms retain their framework APIs. A small CRUD operation does not need a new service layer solely to use Effect.

## Where code belongs

| Location | Responsibility |
| --- | --- |
| `packages/backend/confect/*.spec.ts` | Function visibility and Effect Schema argument, result, and public error contracts |
| `packages/backend/confect/*.impl.ts` | Effect handlers, authorization, and business logic |
| `packages/backend/confect/identity.ts` | Request-scoped identity and the authenticated handler helper |
| `packages/backend/confect/_generated` | Confect-generated services, refs, schema, and registered functions |
| `packages/backend/convex` | Generated adapters plus native component/environment configuration |
| `packages/backend/native.ts` | Typed native client references derived from generated adapters |
| `packages/backend/test` | Backend tests outside the directory Confect replaces |
| `packages/effect` | Portable Promise boundary and its contract tests |

Confect codegen replaces non-reserved files under `convex`. Put helpers, auth configuration, schema/table definitions, and tests outside that directory. `convex.config.ts` and `tsconfig.json` are native configuration exceptions. Do not edit either generator's output by hand.

Backend tests use `test/**/*.test.ts`. Vitest deliberately discovers only that directory so Confect's `*.spec.ts` contracts are not mistaken for test suites.

Use native Convex APIs for component configuration and crons, and when a feature is not supported by Confect. Its `convexPublicQuery`/`convexInternalMutation` and related spec constructors support plain Convex function implementations. Keep these authored inputs under `confect` and let codegen place their adapters; an escape hatch must not leave manually authored files in a directory the generator replaces.

## Developing a function

Add a Confect spec and implementation, following `session.spec.ts` and `session.impl.ts`. Private application operations use `withAuthenticatedIdentity`, then enforce resource ownership or organization membership. Authentication alone does not authorize access to another user's records. The `currentViewer` example returns only the canonical `tokenIdentifier`, name, and email from the authenticated request; it does not create a users table.

Declare public failures as safe Effect Schema tagged errors. `Unauthenticated` exposes fixed code/message fields; do not serialize SDK exceptions, tokens, stack traces, or arbitrary causes to clients. Confect provides the request's Auth/database services and runs the handler. Return an Effect from the implementation instead of calling an Effect runtime yourself.

Run `bun run confect:codegen` to regenerate adapters locally, then the owning typecheck and focused tests. CI repeats generation and rejects tracked or untracked drift. The backend's normal `dev` script first generates adapters, then runs `confect dev` and `convex dev` concurrently. Confect watches authored code; the separate Convex process synchronizes the backend. Bun stops the group if either process fails. Development servers and remote Convex commands require the separately authorized environment setup.

Confect refs are the canonical committed function contract. The old native `_generated/api` files and package export were removed because they referenced the replaced Fluent helpers. Native Convex development/codegen can regenerate those files when needed; this migration does not invoke a deployment or change stored data. Existing native generated server/data-model types remain valid for the unchanged environment and empty schema.

## Web and native clients

The authenticated `/app` route uses the Confect viewer query through `convex-route-query`, the existing TanStack cache, and the existing WorkOS/Convex provider. SSR queries still wait for the WorkOS token. Public routes remain usable without authentication.

Confect 9's `Ref.getFunctionReference` omits argument/result types. `@repo/backend/native` derives them from the generated Convex adapter with the public `ApiFromModules` type, then uses native `makeFunctionReference` to avoid shipping the backend schema graph to clients. Add native references there as application routes need them, with a name-parity test against Confect refs. These references expose **encoded wire values** and native `ConvexError` failures; they do not decode Effect classes, dates, or tagged errors. Keep UI-facing contracts simple, or explicitly decode at the boundary. Confect-aware clients can instead use `@repo/backend/refs`. Do not mix two caches/subscriptions for the same function.

Existing Zod environment checks and FormAdapter forms remain supported. Use Effect Schema for new domain and backend contracts. Do not replace form schemas with Effect 3 schemas through an improvised metadata converter: validation compatibility alone does not supply FormAdapter's JSON Schema field metadata.

`@repo/effect/runtime` uses Effect and an optional `AbortSignal`, with no Node or DOM UI dependency. Pure domain services can be shared with React Native. Native storage, networking, authentication, and lifecycle adapters still require platform testing; this repository does not claim an Expo/device validation. Keep server SDKs and Confect implementations out of client imports.

## Execution and failure policy

At a native Promise boundary, call `runEffect({ effect, signal })`. Its input requires `Effect<A, never, never>`: provide dependencies and handle each expected failure first. The server PostHog helper demonstrates scoped acquisition/cleanup and an explicit best-effort policy for telemetry failures. The runtime tests demonstrate dependency provision, tagged recovery, cancellation cleanup, and defects remaining rejected promises.

For larger workflows, define narrow Effect services and provide live/test implementations at the owning boundary. Keep SDK-to-tagged-error conversion in adapters. Retry only known transient, idempotent operations. Do not convert expected failures to defects with `orDie` just to satisfy the runner, or silence an unresolved service with a cast.

Use Convex mutations for transactional writes and actions for external side effects. Migrations and Workflow remain registered. Effect cancellation, scopes, retries, and fibers manage a running computation; Convex Workflow and scheduled functions own durable work across process/request termination.

The Effect language service and lint checks run in CI without patching TypeScript. New TypeScript workspaces must inherit the shared base configuration; diagnostics automatically discover `apps/*/tsconfig.json` and `packages/*/tsconfig.json`. They help catch discarded Effects and invalid error/dependency declarations. The runtime lint guard catches ordinary direct calls/imports, not every possible alias or dynamic access. These checks cannot prove authorization policy, business correctness, idempotency, or safe treatment of external data; focused tests and review remain necessary.

Sources: [Confect source and versioned documentation](https://github.com/rjdellecese/confect), [Effect language service](https://github.com/Effect-TS/language-service), [Convex function contracts](https://docs.convex.dev/functions).

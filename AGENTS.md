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
- Keep at least one representative starter test, with component tests under `__tests__`. Do not invent backend behavior solely for a sample test.

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Oxlint + Oxfmt (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Oxlint + Oxfmt Can't Help

Oxlint + Oxfmt's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Oxlint + Oxfmt can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Oxlint + Oxfmt. Run `bun x ultracite fix` before committing to ensure compliance.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `packages/backend/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->

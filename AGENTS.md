# Project Development Rules

## Project shape
- Keep the App Router entry points and route-specific files in `src/app`.
- Put reusable design primitives in `src/components/ui`, shared interface pieces in `src/components/shared`, and application shell pieces in `src/components/layout`.
- Keep domain-specific code inside `src/features/<domain>`; promote code to a shared directory only when multiple features need it.
- Use `src/api` for transport/client configuration, `src/services` for domain operations, `src/hooks` for shared React hooks, `src/store` for Zustand state, `src/types` for shared types, and `src/schemas` for shared Zod schemas.
- Keep `src/lib`, `src/utils`, and `src/constants` focused on framework integrations, small pure helpers, and stable shared values respectively.

## TypeScript and React
- Use TypeScript for all application code. Avoid `any`; model external or untrusted values as `unknown` and validate them.
- Prefer small, typed components and functions. Keep server components as the default; add a client boundary only when browser state or interaction requires it.
- Use named exports for shared modules and keep imports organized. Use the `@/*` alias for paths under `src`.
- Do not hide errors with broad assertions, `@ts-ignore`, or empty catch blocks.

## Styling and UI
- Use Tailwind CSS utilities and the established global stylesheet. Keep global CSS limited to resets, tokens, and truly global rules.
- Use shadcn/ui primitives from `src/components/ui` and compose them rather than duplicating their behavior.
- Keep components accessible: semantic HTML, keyboard support, visible focus states, and labels for controls.

## Data and validation
- Do not hardcode or invent backend behavior. Keep network access behind `src/api` and `src/services`.
- Validate form and external input with Zod; use React Hook Form for form state when forms are introduced.
- Use TanStack Query for server state and Zustand only for client state that benefits from a shared store.
- Keep credentials and secrets out of source control; use documented environment variables when integrations are added.

## Quality and workflow
- Follow the existing ESLint and TypeScript configuration. Run `npm run lint` and `npx tsc --noEmit` before handing off code changes.
- Keep dependencies purposeful and prefer existing project tools before adding another package.
- Do not add pages, product flows, or backend integrations without an explicit task to do so.
- Use Node.js 24.x and npm for local development and deployment builds. Configure `NEXT_PUBLIC_API_URL`; optional public values are `NEXT_PUBLIC_SUPPORT_EMAIL` and `NEXT_PUBLIC_SITE_URL`. `NEXT_PUBLIC_*` values are public in client bundles and must never contain secrets.
- Authentication is handled by same-origin `/api/auth/*` route handlers. The session token must remain in an HttpOnly cookie and must never be read into client JavaScript, logs, or client-persisted state.
- Before a local production build, stop the dev server, remove `.next`, run `npm run build`, then `npm run start`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

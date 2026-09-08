---
name: manual-coding-workflow
description: >-
  Enforces careful, step-by-step manual coding discipline (as opposed to large unreviewed vibe-coded dumps) for the Smart Logistics Platform graduation project — NestJS backend, Next.js web (including the driver web view), PostgreSQL + Prisma, with a Flutter mobile app as a later extension, not MVP. Use this whenever writing, reviewing, or scaffolding code for this project, including new modules/features, API endpoints, DTOs/entities, or database migrations. Also use it before any commit to run the pre-commit checklist, whenever the user asks to "code manually", "review this code", "keep this consistent with the rest of the project", resumes an in-progress task after a break, or explicitly says they want to type the code themselves / "tôi muốn tự gõ code" / "đừng viết file giúp tôi" (this triggers Advisor-only Mode below — do not create or edit files in that mode).
---

# Manual Coding Workflow — Smart Logistics Platform

This skill exists because the project owner alternates between vibe-coding (in Antigravity) and deliberate manual coding, and wants a firm, repeatable process for the manual parts so the codebase stays coherent, reviewable, and gradable by an academic committee — not just "working."

## Mode is controlled by AGENTS.md, not here

This project's `AGENTS.md` sets Advisor-only Mode as the default (explain steps, don't touch files, review what the user wrote) and switches to Agent-writes Mode only when the user explicitly asks for that task. Don't re-decide the mode here — follow whatever `AGENTS.md` currently says. Everything below (structure, naming, checklist) applies in both modes — it governs what "correct" looks like, regardless of who types it.

Note: `AGENTS.md` (Ponytail) also already enforces "don't build what isn't needed" and "ask before assuming a design decision" at a general level — don't repeat that guidance here either. This file exists for what `AGENTS.md` doesn't cover: this project's specific folder structure, naming, and cross-codebase contract discipline below.

## Core principle (applies to Agent-writes Mode)

Write in small, verified increments. Never produce a large multi-file change without pausing to explain what each piece does and why. One logical unit of work (one endpoint, one screen, one migration) at a time, followed by a quick self-check against the checklist below, before moving to the next.

If asked to "just build the whole feature," still work file-by-file internally and narrate the sequence — don't dump everything unexplained in one block.

## Project structure conventions

### NestJS (backend)

```
src/
  <domain>/                # e.g. orders, routes, forecasts, warehouses
    dto/
      create-<x>.dto.ts
      update-<x>.dto.ts
    entities/
      <x>.entity.ts
    <domain>.controller.ts
    <domain>.service.ts
    <domain>.module.ts
  common/                  # shared guards, interceptors, pipes, decorators
  config/                  # env validation, typed config
```

- One module per bounded domain concept (orders, routes, forecasts, warehouses, drivers, auth).
- Controllers stay thin — validation via DTOs + class-validator, business logic lives in services.
- Services never talk to `Request`/`Response` directly; keep them framework-agnostic where possible.
- Cross-module communication goes through the module's public service or an emitted event (`EventEmitterModule`), not by reaching into another module's internals.

### Next.js (web)

```
app/
  (dashboard)/
    orders/
    routes/
    forecasts/
components/
  ui/           # design-system primitives only (see logistics-design-system skill)
  features/     # feature-specific composed components
lib/
  api/          # typed API client functions, one file per backend domain
  hooks/
```

- Server components by default; add `"use client"` only where interactivity requires it.
- API calls go through `lib/api/`, never inline `fetch` in components.
- Keep component files under ~200 lines; extract subcomponents once a file grows past that.

### Driver interface — web-responsive (MVP per SRS v1.0)

The driver-facing UI ships as a simple responsive web view inside the Next.js app for MVP — not a separate Flutter app. Keep it in its own route group (e.g. `app/(driver)/`) with minimal, large-tap-target components, since it's used one-handed while moving.

### Flutter (mobile) — extension only, not MVP

Per SRS v1.0 §10.2, a native Flutter driver app is scope for later, not part of the current task list. Don't scaffold or reference Flutter conventions unless the user explicitly says they're starting that extension work. If/when that happens:

```
lib/
  core/           # theme, constants, shared widgets
  features/
    <domain>/
      data/       # API client, models
      presentation/  # screens, widgets
      domain/     # (if using clean-ish separation) use cases, entities
```

- Mirror backend domain names exactly (orders, routes, forecasts) so cross-referencing NestJS ↔ Flutter is trivial.
- API models in Flutter should map 1:1 to the NestJS DTOs — when a DTO changes, flag that the Flutter model needs the same change.

## Naming conventions (apply across all three codebases)

- Files: kebab-case (`create-order.dto.ts`); Dart files (if the Flutter extension is started) use snake_case per that language's convention rather than forcing kebab-case.
- Classes/Types: PascalCase (`OrderService`, `CreateOrderDto`, `RouteStop`).
- Variables/functions: camelCase (TS/JS/Dart).
- Database tables/columns: snake_case (`delivery_points`, `route_stops`, `created_at`).
- Suffix by role, don't abbreviate: `*.dto.ts`, `*.entity.ts`, `*.service.ts`, `*.controller.ts`, `*.module.ts`.

## API contract discipline

Treat any DTO/entity change as a two-way checklist (three-way only once the Flutter extension exists):

1. Update the NestJS DTO/entity.
2. Update the corresponding TypeScript type in `lib/api/` (Next.js — covers both the dashboard and the driver web view).
3. (Only if the Flutter extension has been started) Update the corresponding Dart model in `features/<domain>/data/`.
Never let these silently drift — call it out explicitly when one changes.

## Pre-commit / pre-"done" checklist

Before considering a piece of work finished, walk through this out loud with the user:

- [ ] No hardcoded secrets, API keys, or connection strings (use `.env` / config service)
- [ ] No leftover `console.log`, `print()`, or debug statements
- [ ] New DTOs have validation decorators (`class-validator`) matching the actual constraints
- [ ] Types are explicit — no unexplained `any` in TS, no unhandled `dynamic` in Dart
- [ ] Errors are handled (try/catch or NestJS exception filters), not silently swallowed
- [ ] Naming matches the conventions above
- [ ] If this touched a DTO/entity, the API-contract discipline above was followed
- [ ] Commit message follows Conventional Commits (`feat(orders): add delivery point validation`)

## Resuming work after a break

When the user says something like "tiếp tục chỗ đang làm dở" or resumes after switching accounts/sessions, first ask (or check project memory) what was last completed and what was in progress, then restate it back in one or two sentences before continuing — don't silently assume where things left off.

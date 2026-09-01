---
name: manual-coding-workflow
description: >-
  Enforces careful, step-by-step manual coding discipline (as opposed to large unreviewed vibe-coded dumps) for the Smart Logistics Platform graduation project — NestJS backend, Next.js web, Flutter mobile, PostgreSQL. Use this whenever writing, reviewing, or scaffolding code for this project, including new modules/features, API endpoints, DTOs/entities, Flutter screens, or database migrations. Also use it before any commit to run the pre-commit checklist, whenever the user asks to "code manually", "review this code", "keep this consistent with the rest of the project", resumes an in-progress task after a break, or explicitly says they want to type the code themselves / "tôi muốn tự gõ code" / "đừng viết file giúp tôi" (this triggers Advisor-only Mode below — do not create or edit files in that mode).
---

# Manual Coding Workflow — Smart Logistics Platform

This skill exists because the project owner alternates between vibe-coding (in Antigravity) and deliberate manual coding, and wants a firm, repeatable process for the manual parts so the codebase stays coherent, reviewable, and gradable by an academic committee — not just "working."

## Two distinct modes — do not conflate them

1. **Agent-writes mode** (default when the user asks you to build/implement something without saying otherwise): you write the code, but in small verified increments per the Core Principle below.
2. **Advisor-only Mode** (triggered when the user says they want to type the code themselves, e.g. "tôi muốn tự gõ code", "chỉ hướng dẫn thôi", "đừng viết file giúp tôi"): you do NOT create or edit any project files. Instead:
   - Explain the approach and break it into a short ordered checklist of concrete steps (files to create, what goes in each, key decisions).
   - You may show a short reference snippet inline in the chat as illustration, but do not apply it to a file yourself.
   - Wait for the user to write it and paste or describe what they did; then review it against the conventions and checklist in this skill and give specific feedback.
   - If it's unclear which mode is active, ask once at the start of the task, then stay in that mode for the rest of the session unless the user says otherwise.

Everything below (structure, naming, checklist) applies in both modes — it governs what "correct" looks like, not who types it.

## Resolve decisions before generating any guide or code

Before writing a step-by-step guide, file content, or any code — in either mode — inspect only the SRS, task, and existing code relevant to the requested work. Identify only decisions that are unspecified, material or difficult to reverse, and blocking the current task. Ask at most three short questions. Stop there and wait for answers.

Do not proceed to write concrete guidance "for now" using an assumed default, then ask the questions afterward or alongside it. Writing implementation content before decisions are confirmed means throwing away and redoing that content the moment an answer differs from the assumption — this is the single biggest source of wasted output. The only exception is a decision with one obviously-correct answer and no real trade-off (e.g. file naming that follows the convention below); genuine choices (ORM, auth strategy, schema shape) always wait for the user's answer first.

Do not create a separate guide unless the user explicitly requests one. Do not audit, fix, or list issues from earlier or unrelated tasks unless the user explicitly asks for a review or an issue directly blocks the current task. In the latter case, report it in one sentence and wait for direction.

## Core principle (applies to Agent-writes Mode)

Write in small, verified increments. One logical unit of work (one endpoint, one screen, one migration) at a time, followed by a quick self-check against the checklist below, before moving to the next. Give only a one- or two-sentence status update between units; do not narrate routine implementation details.

If asked to "just build the whole feature," still work file-by-file internally. Do not create a separate plan or guide unless requested.

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

### Flutter (mobile)
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

- Files: kebab-case (`create-order.dto.ts`, `order_repository.dart`... — Dart uses snake_case by convention, keep that language's native convention rather than forcing kebab-case).
- Classes/Types: PascalCase (`OrderService`, `CreateOrderDto`, `RouteStop`).
- Variables/functions: camelCase (TS/JS/Dart).
- Database tables/columns: snake_case (`delivery_points`, `route_stops`, `created_at`).
- Suffix by role, don't abbreviate: `*.dto.ts`, `*.entity.ts`, `*.service.ts`, `*.controller.ts`, `*.module.ts`.

## API contract discipline

Since three codebases consume the same backend contracts, treat any DTO/entity change as a three-way checklist:
1. Update the NestJS DTO/entity.
2. Update the corresponding TypeScript type in `lib/api/` (Next.js).
3. Update the corresponding Dart model in `features/<domain>/data/` (Flutter).
Never let these silently drift — call it out explicitly when one changes.

## Pre-commit / pre-"done" checklist

Before considering a piece of work finished, check the following internally. Report only failures, relevant caveats, or a one-line confirmation:
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

---
name: logistics-design-system
description: >-
  Baseline design system (colors, typography, spacing, component patterns) for the Smart Logistics Platform graduation project, kept in sync between the Next.js + TailwindCSS web dashboard and the Flutter mobile app. Use this whenever building or reviewing any UI, including pages, screens, components, widgets, dashboards, forms, tables, and maps, in either the web or mobile codebase, and whenever the user asks about styling, layout, "consistency", colors, or design drift between web and mobile. This is the source of truth — do not invent new colors, spacing values, or type sizes outside of what's defined here without updating this file first.
---

# Logistics Design System

No existing brand/mockup was provided, so this is the baseline definition. Treat it as the single source of truth for both platforms — if a value isn't here, don't improvise it; extend this file first, then use it.

## Color palette

| Token | Hex | Use |
|---|---|---|
| `primary` | `#1E3A8A` (deep blue) | Primary actions, headers, active nav |
| `primary-light` | `#3B82F6` | Hover states, links, secondary emphasis |
| `accent` | `#F59E0B` (amber) | Highlights, in-transit/warning status |
| `success` | `#16A34A` | Delivered, completed, on-target forecast |
| `danger` | `#DC2626` | Delayed, failed delivery, stockout alert |
| `neutral-900` | `#111827` | Primary text |
| `neutral-500` | `#6B7280` | Secondary text |
| `neutral-100` | `#F3F4F6` | Backgrounds, cards |
| `white` | `#FFFFFF` | Surfaces |

Status colors are semantic and must be used consistently everywhere a status appears (order status, delivery status, forecast confidence):
- Pending → `neutral-500`
- In transit → `accent`
- Delivered → `success`
- Delayed / failed → `danger`

## Typography

- Font family: Inter (web via `next/font`, mobile via Flutter `google_fonts` package) — pick one, don't mix.
- Scale (Tailwind-style, use consistently, map to Flutter `TextTheme`):
  - `text-xs` 12px — captions, timestamps
  - `text-sm` 14px — body secondary, table cells
  - `text-base` 16px — body default
  - `text-lg` 18px — section headers
  - `text-xl` 20px — card titles
  - `text-2xl` 24px — page titles
  - `text-3xl` 30px — dashboard headline numbers (e.g. KPI counts)

## Spacing scale

Use Tailwind's default 4px base unit everywhere — don't introduce arbitrary pixel values.
`1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 6 = 24px, 8 = 32px, 12 = 48px, 16 = 64px`

Flutter equivalent: define these as constants in `lib/core/theme/spacing.dart` (`AppSpacing.xs = 4, .sm = 8, .md = 16, .lg = 24, .xl = 32`) so mobile paddings match web paddings at the same semantic level.

## Layout conventions

- Dashboard pages: max content width `1280px` (`max-w-7xl`), centered, `24px` (spacing-6) outer padding on desktop, `16px` on mobile web.
- Cards: `rounded-lg` (8px radius), `neutral-100` background, `16-24px` internal padding, consistent shadow (`shadow-sm`).
- Tables (orders, routes, stock movements): sticky header, zebra striping optional, status column always rendered as a colored badge using the semantic status colors above — never as plain text.
- Forms: label above input, `8px` gap between label and input, `16px` gap between fields.

## Component patterns to reuse (don't reinvent per page)

- **StatusBadge** — pill-shaped, background = status color at 10-15% opacity, text = full status color, used for order/delivery/stock status everywhere.
- **KpiCard** — big number (`text-3xl`) + label (`text-sm`, `neutral-500`) + optional trend indicator, used on dashboard summaries.
- **MapPanel** — consistent map container sizing and marker colors (driver = `primary`, delivery point pending = `neutral-500`, delivered = `success`).
- **DataTable** — shared table shell for Orders, Routes, Stock Movements so column alignment, padding, and typography match across all three.

## Web ↔ Mobile parity checklist

Whenever a screen exists on both platforms (e.g. Order Detail, Route Tracking), check before calling it done:
- [ ] Same color tokens used for the same semantic meaning
- [ ] Same information hierarchy (what's the biggest/first thing the eye sees)
- [ ] Status badges look and behave the same way
- [ ] Spacing feels proportionally the same (mobile can be tighter, but ratios should match)

## Extending this system

If a new UI need doesn't fit an existing token or pattern (new status type, new component), add it here first with a short rationale, then implement it — don't add ad-hoc styles that only live in one component's code.

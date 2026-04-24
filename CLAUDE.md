# CLAUDE.md — D8/SALES_PITCH

@AGENTS.md

## Context

D8TAOPS internal webapp — D8/SALES_PITCH. Built to support D8TAOPS sales operations and case-study-driven sales enablement.

Full personal and professional context is in `~/.claude/CLAUDE.md`.

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Linting:** ESLint

---

## Commands

```bash
npm run dev        # dev server at localhost:3000
npm run build      # production build
npm run lint       # run linter
```

---

## Architecture

- App Router with `src/` directory structure
- Pages and layouts in `src/app/`
- Components in `src/components/` (create as needed)
- Lib/utils in `src/lib/` (create as needed)
- API routes in `src/app/api/` (create as needed)
- Import alias: `@/*` maps to `src/*`

---

## Brand

All UI follows D8TAOPS brand standards from `~/.claude/CLAUDE.md`. Key colors:

| Element | Hex |
|---|---|
| Primary navy | `#081F5C` |
| Section gray | `#515151` |
| Accent blue | `#0477BF` |
| Body text | `#333333` |
| Secondary purple | `#7B5EA7` |

Font: IBM Plex Sans

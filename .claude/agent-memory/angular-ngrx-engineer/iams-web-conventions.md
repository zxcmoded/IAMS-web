---
name: iams-web-conventions
description: IAMS-web stack + architecture conventions established by the first feature (auth + full 5-entity CRUD). Read before building new Angular features here.
metadata:
  type: project
---

IAMS-web was scaffolded greenfield; auth + the 5-entity CRUD (Company, Location,
Warehouse, Rack, Bin) are the convention-setting first features. Per CLAUDE.md,
this now IS the convention.

**How to apply (the load-bearing, non-obvious choices):**
- Angular **21**, **standalone components only** (no NgModules), **zoneless**
  (no zone.js provider), `ChangeDetectionStrategy.OnPush` everywhere, signal
  inputs/outputs (`input()`/`output()`), `inject()` over constructor DI.
- **Tests run on Vitest**, not Karma/Jasmine (`@angular/build:unit-test`
  builder; `vitest/globals` types → `describe/it/expect/vi` are global, no
  imports). Functional effects are tested via
  `TestBed.runInInjectionContext(effect)` + `provideMockActions`;
  `provideMockStore` for store-reading effects/components.
- UI lib is **Angular Material** (azure-blue theme, Material 3 CSS system vars
  `--mat-sys-*`). Use `matButton="filled"` attribute-button syntax (M3).
- **Avoid output names that are native DOM events** (`cancel` is NOT allowed —
  use `cancelled`) — angular-eslint `no-output-native` fails the build.
- All API URLs live ONLY in `core/api/api-endpoints.ts`; all wire shapes behind
  typed `*-api.service.ts` per feature. Env origin is `environments/` `apiBaseUrl`
  (origin only; `/api/...` composed in endpoints). Dev build uses
  `fileReplacements` to swap `environment.development.ts`.
- **Per-entity NgRx pattern:** feature state + effects registered at the ROUTE
  level via `provideState`/`provideEffects` in `<entity>.routes.ts` (lazy), NOT
  globally. `@ngrx/entity` adapter (Company keyed by `companyId`; L/W/R/B by
  `code`). Server-side pagination: adapter holds the current page, `totalCount`
  separate. Mutations use `exhaustMap`, loads/search/filter use `switchMap`,
  success → reload list via `concatLatestFrom(store.select(listQuery))`.
  Only `auth` + `lookups` slices are registered globally in app.config.
- JWT storage: `TokenStorageService` (localStorage + memory mirror) — the only
  place storage is touched. Role gate = code >= 700 lives in `role.model.ts`.

Contract-wiring conventions (after the final API contract landed):
- **No `/me` or refresh endpoint exists.** Bootstrap restores the session
  client-side from persisted `{token,user}` (`TokenStorageService.getSession`)
  via `AuthActions.sessionRestored`; an expired token is caught lazily by the
  401 error interceptor. Do NOT add a `/auth/me` call.
- List envelope is `AdminPage<T>` (`page` is 1-BASED). The paginator is 0-based;
  map `page = pageIndex + 1` in `buildListParams` (core/api) and
  `pageIndex = page - 1` in each reducer's loadSuccess. Default pageSize 25.
- Errors are RFC7807; `toApiError` reads `detail`/`title` for the message,
  `code` for machine handling, `errors` for field messages. Field errors render
  via `shared/util/field-error.util` (`fieldError`/`codeConflictError`/`parentError`).
- **Cascading parent dropdowns** (L/W/R/B create forms AND list parent-filters)
  are ALL driven by ONE shared widget `shared/components/ancestor-select`
  backed by a global `lookups` NgRx slice (`core/lookups`). It loads
  Company→…→target options, clears deeper levels on ancestor change, and emits
  the immediate-parent code. Entity create POSTs send ONLY the immediate parent
  (+ companyId for Location) — the server derives ancestry. Code is immutable →
  read-only on every edit form.
- Company create/delete are SuperAdmin(>=800)-gated in the UI
  (`selectIsSuperAdmin` → DataTable `showCreate`/`showDelete`); 403
  `access_denied` still handled as a toast fallback. L/W/R/B CRUD is
  Admin(>=700)-allowed.

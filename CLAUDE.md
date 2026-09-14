# IAMS-web

Angular web client for the Inventory and Asset Management System. TypeScript, RxJS, NgRx.

Use NgRx (actions/reducers/effects/selectors) as the single source of truth for shared/global
state; keep purely local, ephemeral UI state out of the store. Smart (container) components talk to
the store; dumb (presentational) components only take `@Input()`/emit `@Output()` — no store access
or HTTP calls in presentational components.

This repo is currently an empty scaffold (only `LICENSE`/`README.md`). Whatever component/state
structure the first real feature establishes becomes the convention for everything after it.

See the workspace-level `../CLAUDE.md` for the Agent Teams setup this repo is part of.

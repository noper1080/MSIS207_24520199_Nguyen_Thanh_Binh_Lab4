# project-rules.md: Lab 4 (React Router v7, Context Form Engine, Express API)

> Read this file before every task. Copy to `.cursorrules` in the repo root.
> *Generate with AI. Verify with engineering.*
> Talk to the developer in Vietnamese. Write code, comments, commits, and docs in English.
> Scope of this version: Exercises 1.1, 1.2, 1.2.1, 1.2.2, 1.3, 1.7.1 (Sprints 1-3).
> Homework rules are added later, when the developer sends their screenshots.

## 0. SCOPE GUARD (highest priority)

- Build the **MINIMUM** that satisfies the requirements of the current exercise. Nothing more.
- Requirements come ONLY from the screenshot or task text the developer gives you.
  Never invent features, props, pages, themes, animations, or options.
- Small hardcoded data (about 4-6 items), clearly fictional. No auth, no global state library.
- **Never add a dependency** outside the allow-list in section 1. If one seems needed, stop and ask.
- If something is unclear or not specified here or in the task: **ask. Do not decide on your own.**
  When code in a screenshot conflicts with this file or contains an obvious bug, point it out; do not copy it blindly.
- One task per prompt. Touch only the files named in that task's WBS entry.

## 1. Stack and Repo Layout

```
repo-root/
├── project-rules.md  TASK_DECOMPOSITION.md  AI_FAILURE_AUDIT.md  .env.example  .gitignore
├── client/   Vite + React 19, .jsx, JSDoc contracts   (src/pages, components, context, hooks, lib)
└── server/   Express, ESM ("type": "module")          (server.js, lib/)
```

- **Allowed dependencies:** client: `react`, `react-dom`, `react-router` (v7), `vite`, `vitest` (dev).
  server: `express`, `cors`, and `mongoose` (v8) only for a task that explicitly needs MongoDB.
- Server runs with `node --env-file=.env --watch server.js` (Node 20.6+). No `dotenv`, no `nodemon`.
- Env: `server/.env` and `client/.env` are git-ignored. `.env.example` (repo root) documents every
  variable with fake values: `PORT`, `CLIENT_ORIGIN`, `VITE_API_URL`, and `MONGODB_URI` if used.
- Client mounts with `createRoot` inside `<StrictMode>` and wraps `<App />` in `<BrowserRouter>`.
- Import only what you use (`import { lazy, Suspense } from 'react'`), never `import * as React`.

## 2. Banned Patterns

| Banned | Use instead |
|---|---|
| React Router v5 (`Switch`, `Redirect`, `exact`, `activeClassName`, `component={...}`) | `Routes`, `Route element={...}`, `Navigate`, `NavLink` with callback `className` |
| `class extends React.Component`, `ReactDOM.render`, `defaultProps`, `PropTypes` | Function components, `createRoot`, default parameters, JSDoc |
| Material-UI v4, `react-media`, `typeface-roboto`, any UI kit | Semantic HTML, CSS Grid, `@media`, `@font-face` |
| `useEffect` for validation or derived data (including chained effects) | Compute during render |
| `didCancel` boolean flags | `AbortController` |
| Effects with missing or dishonest dependency arrays | List every reactive value used |
| Hardcoded connection strings, passwords, or secrets | `process.env`, `.env.example` |
| Mongoose callbacks (`.exec((err, doc) => ...)`), `useNewUrlParser`, `useUnifiedTopology` | `await Model.find()...`, `await mongoose.connect(uri)` |
| `require()` in the server | ESM `import` |
| `innerHTML`, `dangerouslySetInnerHTML` | JSX text |
| `window.alert()`, `keyCode`, `keypress` | `role="alert"`, `e.key` / `e.code` |
| `http://` URLs (except `http://localhost` dev defaults) | `https://` |
| `key={index}`, `key={text}` | `key={item.id}` |
| Mutating state or props | `[...prev, x]`, `filter`, `toSorted`, spread |
| Inline `style={{}}`, hex colors outside `:root` | CSS Module or `index.css` with custom properties |
| `var`, `import * as React` | `const`/`let`, named imports |
| Icon-only buttons without a label | `aria-label` |

## 3. Semantic HTML and Accessibility

- Prefer semantic tags: `header`, `nav aria-label`, `main`, `section`, `article`, `aside`, `dl/dt/dd`, `output`, `Fragment`.
  A `<div>` is allowed only as a pure layout wrapper when no semantic tag fits, and never directly inside a `<dl>`
  (use `<Fragment key>` per `dt`/`dd` pair).
- Exactly one `<h1>` per page and one `<main>`. Headings stay sequential.
- Every `<input>` has a visible `<label htmlFor={id}>`; `id` from `useId()`, one per field.
- Invalid fields: `aria-invalid`, `aria-describedby` pointing to the error element, error text with `role="alert"`.
- Loading: skeleton with `aria-busy="true"`; announce through a persistent `aria-live="polite"` container
  (a live region that is mounted together with its content is not reliably announced).
- Errors/404: `role="alert"` message plus a way to recover (link back or retry button). `<button type="button">` always.
- Keyboard only must work everywhere; visible focus; text contrast >= 4.5:1; never color alone.
- Images: `width`/`height`, meaningful `alt`.

## 4. React Rules

- Pure function components; UI = f(props, state, context). Never mutate props or state.
- `useState` holds only independent source-of-truth values. Errors, validity, filtered/derived data are **computed during render**.
- No `useMemo`/`useCallback`/`memo` unless a task requires it or the Profiler shows a problem.
- Hooks only at top level. Every effect that starts a fetch, timer, or listener returns its cleanup.
  Must survive StrictMode double-invoke.
- Lists use stable ids as `key`.

## 5. Routing (React Router v7, declarative mode)

- Import from `'react-router'`: `Routes`, `Route`, `NavLink`, `Outlet`, `useParams`, `Navigate`. Do NOT use `createBrowserRouter`.
- Shared layouts: parent `<Route path=... element={<Layout />}>` with child routes; the layout renders `<Outlet />` inside `<main>`.
  A layout returns **one root** or a `Fragment` (never two sibling elements without a wrapper).
- `NavLink`: always has `to`; active style via `className={({ isActive }) => ...}`; links to `/` or an index route use `end`.
- URL params are **strings**: dataset ids are strings, compared with `===`.
- Lookup with `find()`; if nothing matches, render a `NotFoundState` component (`role="alert"` + link back). No crash, no blank page.
- Code-splitting: `lazy(() => import('./X'))` (the module has a **default export**), wrapped in
  `<Suspense fallback={<Skeleton ... />}>`. The skeleton has the **same width/height as the final content** (CLS = 0)
  and `aria-busy="true"`. Verify on DevTools Slow 3G.
- Master-detail layout is mobile-first: **one column by default**; the two-column grid
  `grid-template-columns: minmax(280px, 1fr) 2fr` applies only from a wider breakpoint. No horizontal scroll at 375px.

## 6. Forms and Context (synchronous validation)

- `FormProvider` holds `values` (state) and exposes `{ values, errors, isValid, handleChange, ... }` via Context + a `useFormContext()` hook.
- `errors = validateForm(values)` is a **pure function called during render**. Zero `useEffect`, no mirrored error state,
  no state synced between parent and child.
- Show a field's error only after it was touched (blur) or a submit was attempted. Validity is always computed.
- `InputField`: own `useId()`, `<label htmlFor>`, `aria-invalid`, `aria-describedby`, error with `role="alert"`; it reads from context.
- Cross-field rules (e.g. confirm password) are just more checks inside `validateForm`.
- Submit: `preventDefault`; only when `isValid`, store the submitted data and render `<ShowData data={...} />`:
  a `<dl>` with `<Fragment key={key}><dt/><dd>{String(value)}</dd></Fragment>` (never `JSON.stringify` dumps).
- `validateForm` must live in `client/src/lib/` as a separate pure module so it can be unit-tested.

## 7. Data Fetching (client) and Express (server)

**Client hook pattern** (`useForumMessages(channelId)`):
- New `AbortController` inside the effect; pass `{ signal }`; cleanup calls `controller.abort()`; dependency array `[channelId]`.
- Check `res.ok` before `res.json()`; throw on non-2xx.
- On `AbortError`: return silently, **never** set an error state. Ignore any result from an aborted request.
- Returns a 4-state value `{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR', data, error }` (no boolean combinations)
  unless the task's screenshot specifies another shape. Retry = a counter in the dependency array.
- Base URL from `import.meta.env.VITE_API_URL`; never hardcode a host inside components.
- Render messages as `<dl>` with `<Fragment key={msg.id}>`; text only.

**Server rules:**
- Middleware order: `cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' })`, then `express.json()`, then routes.
- Handlers are `async` with `try/catch`; responses are JSON; errors are `{ error: string }`.
- Validate every POST body with a pure `validateMessage(body)` (in `server/lib/`): **whitelist** fields, check types and lengths,
  ignore everything else, return 400 with a clear message on failure. Never pass `req.body` straight to a store/model.
- The server assigns `id` (`crypto.randomUUID()`) and `timestamp` (ISO 8601). Clients never choose them.
- **Client/server validation parity:** the same rules and limits on both sides; a test case list that passes on both.
- Storage for exercises: an in-memory `Map` seeded with 2-3 messages per channel. No MongoDB unless a task says so.
- If a task uses Mongoose 8: `if (!process.env.MONGODB_URI) throw ...`; `await mongoose.connect(process.env.MONGODB_URI)`;
  async/await only; `.lean()` for reads; whitelist fields before `create`.

## 8. API Contract (shared by client and server; change only via the WBS)

| Method and path | Success | Failure |
|---|---|---|
| `GET /api/channels/:channelId/messages` | 200 `[{ id, text, author, timestamp }]` | 404 `{ error }` if the channel is unknown |
| `POST /api/channels/:channelId/messages` body `{ text, author }` | 201 the created message | 400 `{ error }` invalid body; 404 unknown channel |

- Channels: `nasa`, `esports-tribunal`, `notNasa`.
- Default limits (use unless the screenshot says otherwise): `text` 1-500 chars, `author` 1-50 chars, both strings after trim.

## 9. CSS

- `client/src/index.css`: reset (`box-sizing: border-box; margin: 0; padding: 0`) and `:root` tokens.
  **Hex colors only inside `:root`.** Components use CSS Modules + `var(--token)`.
- Flexbox for 1-D, Grid for 2-D, `gap` instead of margins between children. Mobile-first, perfect at **375px**.
- Skeleton shimmer in pure CSS; honor `prefers-reduced-motion`.

## 10. Security

- Render data only as JSX text. Test once with `<img src=x onerror=alert(1)>`: it must stay plain text.
- No secrets in source or git history; `.env` files are git-ignored; only `.env.example` is committed.
- Server never trusts the client: validate, whitelist, limit sizes.

## 11. Workflow (4-stage contract-first loop)

1. **Contract:** define the interface/spec first (JSDoc, API table, validation rules) in the WBS.
2. **Fail test:** write a failing automated test for the pure logic (Vitest; `validateForm`, `validateMessage`, lookup helpers).
   Test only pure functions; no UI test suite. Commit it as `test(...)`.
3. **Implement:** the minimum code that makes the test pass.
4. **Refactor:** clean up while tests stay green.
- UI-only tasks (routing, layout, skeleton) skip the test stage and are verified with DevTools instead.

**WBS protocol** (developer sends this file + a screenshot of ONE exercise): output a section for `TASK_DECOMPOSITION.md`, no implementation code.
Take requirements only from the screenshot. Slice into small verifiable tasks (contract -> test -> logic -> JSX -> CSS -> behavior/a11y -> verification).
Each task lists: ID and goal, contract, files touched (exact paths), acceptance criteria, verification, commit message.
Never mix JSX/CSS/logic in one commit. End with **Open questions** for anything ambiguous or contradictory; never guess.

**Code protocol:** one task per prompt. Restate the contract and assumptions first. Edit only the task's files. List what changed and what you were unsure about.
The developer reviews `git diff` before every commit.

Prompt template:
```
Read project-rules.md.
Task: <ID>  (WBS entry pasted below)
Do only this task. Restate the contract and assumptions first.
```

## 12. Git

- Conventional Commits, one concern each: `docs(spec)`, `test(...)`, `feat(...)`, `fix(...)`, `style(...)`, `chore`, `docs(audit)`.
- WBS/contract `docs(spec)` commit before its code. Test commit before its implementation.
- Sprint targets from the slides: Sprint 1 = 2 feat commits (router layout, detail route handling); Sprint 2 = 3 feat commits
  (form context, input field validation, inspector output); Sprint 3 = as stated in its screenshot. `test` and `docs` commits are separate from these counts.
- Never commit `.env` or `node_modules`.

## 13. AI_FAILURE_AUDIT.md, Checkpoints, Definition of Done

**Audit:** log each real AI defect as `Failure #NN -> Prompt -> AI code -> Bug -> Detection (DevTools/diff proof) -> Fix + commit`.
At least 3 verified entries. Watchlist: Router v5 syntax in a v7 project; `useEffect` validation loops; hardcoded DB secrets;
Mongoose 5 callbacks; unlabelled icon buttons; missing `res.ok`; AbortError shown as an error; missing `express.json()`; `createBrowserRouter` mixed with `Routes`.

**Checkpoints:**
```bash
git grep -nE "Switch|Redirect|activeClassName|defaultProps|didCancel|useNewUrlParser|useUnifiedTopology" -- client/src server
git grep -n "http://" -- client/src server | grep -v localhost     # expect: no output
git ls-files | grep -E "(^|/)\.env$"                                # expect: no output
npx vitest run                                                       # logic tests green
```
DevTools: Accessibility tree, 375px (no horizontal scroll), Network Slow 3G (aborted requests show `canceled`), React Profiler (render counts), zero console warnings.

**Done (per task):**
- [ ] Meets the acceptance criteria and adds nothing extra
- [ ] No rule in this file violated (checked in `git diff`)
- [ ] Verified at 375px and with keyboard where relevant
- [ ] Committed atomically with the planned message
- [ ] Developer can explain every line without AI

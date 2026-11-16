# TASK_DECOMPOSITION.md

## Exercise 1.1: Performance and Resiliency Architectural Upgrades

Source: screenshot of Exercise 1.1 only. No implementation code in this section.

### 1. Requirements extracted from the screenshot

| # | Requirement (from screenshot) | Rule check (project-rules.md) |
|---|---|---|
| R1 | Code-splitting: dynamic import via `lazy(() => import('./PersonDetail'))` for route-level chunking | Sec. 5: use named import `lazy`, not `React.lazy`; module needs a **default export** |
| R2 | Suspense boundary wraps the route: `<Suspense fallback={...}>` | Sec. 5 |
| R3 | Zero layout shift: skeleton fallback has the same dimensions as the final content (CLS = 0) | Sec. 5, Sec. 9 |
| R4 | Accessibility: skeleton has `aria-busy="true"` and `aria-live="polite"` | **Conflict**: Sec. 3 says the live region must be persistent and mounted before its content. See Open question Q1 |

Out of scope (not in the screenshot): list page, router layout, data fetching, theming, animations beyond a basic shimmer required by Sec. 9.

### 2. Decisions (resolved from the former open questions)

- D1 (Q1): Follow Sec. 3. `Skeleton` carries `aria-busy="true"`; a persistent `aria-live="polite"` region lives in the layout and is never unmounted. The screenshot's `aria-live` on `<Skeleton>` is intentionally not copied.
- D2 (Q2): Repo root is `MSIS207_24520199_Nguyen_Thanh_Binh_Lab4/`. `client/` does not exist yet, so a minimal scaffold (P1-P3) runs first. Paths: `client/src/main.jsx`, `client/src/App.jsx`, `client/src/components/Layout.jsx`. The scaffold is the bare minimum for the exercise, not the full Sprint 1 router layout.
- D3 (Q3): `PersonDetail` shows one fixed fictional person (name, role, email, as a `dl`). No `:id` param, no lookup (that belongs to later exercises). Route path: `/person`.
- D4 (Q4): The detail block has a fixed height token `--detail-height: 16rem` and `max-width: 40rem`, width 100%, at every breakpoint. Skeleton uses the same tokens. Fixed values keep CLS = 0 without measurement.
- D5 (Q5): One `Suspense` boundary around the `PersonDetail` route element only. Other routes stay eager.
- D6 (Q6): `Skeleton` takes no props. Its size comes only from CSS tokens.

### 3. Task list (order matters)

Legend: contract -> logic -> JSX -> CSS -> behavior/a11y -> verification.
This exercise is UI-only, so the "fail test" stage is skipped (Sec. 11). Verified with DevTools.

---

#### P1: Client scaffold
- **Goal:** Vite + React 19 app with only allowed dependencies (D2).
- **Contract:** `client/` with `react`, `react-dom`, `react-router` v7, `vite`, `@vitejs/plugin-react` (Vite's React plugin is required by Vite; confirm it is acceptable, see Q7). `main.jsx` uses `createRoot` inside `<StrictMode>` and wraps `<App />` in `<BrowserRouter>`.
- **Files touched:** `client/package.json`, `client/index.html`, `client/vite.config.js`, `client/src/main.jsx`, `client/src/index.css` (reset and empty `:root`), root `.gitignore`.
- **Acceptance:** `npm run dev` serves a blank app; `.env` and `node_modules` ignored.
- **Verification:** Browser loads with zero console warnings.
- **Commit:** `chore(client): scaffold vite react app`

#### P2: Layout with persistent live region
- **Goal:** Shared layout (`header`, `nav aria-label`, one `<main>` with `<Outlet />`, one `<h1>`) plus the live region of D1.
- **Contract:** `Layout()` returns one root; the live region is a sibling of `<main>` inside that root and is always mounted.
- **Files touched:** `client/src/components/Layout.jsx`, `client/src/components/Layout.module.css`
- **Acceptance:** One `<h1>`, one `<main>`; `NavLink` uses a callback `className` and `end` where needed.
- **Verification:** Accessibility tree; 375px, no horizontal scroll.
- **Commit:** `feat(router): add shared layout with outlet and live region`

#### P3: Routes
- **Goal:** `App` with `Routes` and a layout parent route; one home route and the `/person` route (wired in 1.1-07).
- **Files touched:** `client/src/App.jsx`
- **Acceptance:** No `createBrowserRouter`, no v5 syntax.
- **Verification:** Navigate between routes by keyboard.
- **Commit:** `feat(router): add routes under shared layout`

> P1 to P3 stand in for Sprint 1 only as far as this exercise needs; they do not add detail lookup or 404 handling.

#### 1.1-01: Contract and WBS
- **Goal:** Freeze the contract for lazy loading and the skeleton.
- **Contract (JSDoc to be added in later tasks):**
  - `PersonDetail`: default export, no props required by this exercise (A2).
  - `Skeleton({ className })`: renders one root element with `aria-busy="true"`. Its size comes from CSS custom properties shared with `PersonDetail`, not from inline styles.
  - `LiveRegion`: persistent `aria-live="polite"` container, mounted in the layout (see Q1).
- **Files touched:** `TASK_DECOMPOSITION.md`
- **Acceptance:** This section is committed before any code.
- **Verification:** `git show --stat` lists only this file.
- **Commit:** `docs(spec): add WBS for exercise 1.1 lazy loading and suspense skeleton`

#### 1.1-02: PersonDetail page as default export (JSX)
- **Goal:** Provide the lazy target with a **default export** and a stable, measurable structure.
- **Contract:** `export default function PersonDetail()`; one fixed fictional person (name, role, email) in `article` + `h2` + `dl` with `<Fragment key>` pairs; no `<h1>` here (layout owns it, Sec. 3).
- **Files touched:** `client/src/pages/PersonDetail.jsx` (create or edit if it exists)
- **Acceptance:**
  - Default export present.
  - No inline `style`, no `key={index}`, no `dangerouslySetInnerHTML`.
  - Any image has `width`, `height`, `alt`.
- **Verification:** Open the route; heading order is sequential in the Accessibility tree.
- **Commit:** `feat(person-detail): add default-exported PersonDetail page`

#### 1.1-03: PersonDetail dimensions (CSS)
- **Goal:** Define the final content's width/height as tokens so the skeleton can reuse them (R3).
- **Contract:** Custom properties in `:root` of `client/src/index.css`: `--detail-height: 16rem`, `--detail-max-width: 40rem` (D4). Component rules live in a CSS Module and use `var(--token)`. Hex colors only inside `:root`.
- **Files touched:** `client/src/index.css`, `client/src/pages/PersonDetail.module.css`. Applying the class needs a one-line change in `client/src/pages/PersonDetail.jsx` (import `styles`, `className={styles.detail}`), committed separately as `feat(person-detail): apply dimension styles to PersonDetail` right after this task.
- **Acceptance:**
  - Fixed height/min-height at 375px and at the wide breakpoint.
  - Mobile-first, one column by default.
  - No horizontal scroll at 375px.
- **Verification:** DevTools device toolbar at 375px; Computed tab shows the expected box size.
- **Commit:** `style(person-detail): define content dimensions as design tokens`

#### 1.1-04: Skeleton component with loading announcement (JSX)
- **Goal:** Dimension-matched fallback that exposes loading state (R3, R4). This task absorbs the former 1.1-06.
- **Contract:** `Skeleton()` takes no props (D6) and returns one root `<div>` (pure layout wrapper, allowed by Sec. 3) with `aria-busy="true"`. Placed in `client/src/components/`. It also renders, via `createPortal` (from `react-dom`), the text "Loading person details" into the persistent `#live-status` element created in P2 (D1, Q8). The portal unmounts with the skeleton, which clears the message. If the element is not found, render nothing extra. No state, no effect.
- **Files touched:** `client/src/components/Skeleton.jsx`
- **Acceptance:**
  - `aria-busy="true"` present on the root.
  - No inline `style`; no `aria-live` on the skeleton itself (D1).
  - The message appears in `#live-status` only while the skeleton is shown; the live region is never unmounted.
  - No `useEffect`; no console warnings under StrictMode.
- **Verification:** Slow 3G; Elements panel shows the attribute and the text appearing/disappearing inside `#live-status`.
- **Commit:** `feat(skeleton): add Skeleton fallback with aria-busy and live announcement`

#### 1.1-05: Skeleton styling (CSS)
- **Goal:** Same box as `PersonDetail`, with a pure-CSS shimmer.
- **Contract:** `Skeleton.module.css` reads the tokens from 1.1-03 (same width/height/min-height values and breakpoints). Shimmer via `@keyframes`; `@media (prefers-reduced-motion: reduce)` disables it.
- **Files touched:** `client/src/components/Skeleton.module.css`
- **Acceptance:**
  - Skeleton box size equals the final content box size at 375px and at the wide breakpoint.
  - Shimmer stops with reduced motion on.
  - Text-vs-background contrast is not relevant (no text), but the shimmer is not the only loading signal (a11y text comes from Task 1.1-04).
- **Verification:** DevTools: Rendering tab -> emulate `prefers-reduced-motion`; compare box sizes in Computed.
- **Commit:** `style(skeleton): match PersonDetail dimensions and add reduced-motion shimmer`

#### 1.1-07: Lazy route and Suspense boundary (core feat)
- **Goal:** Route-level chunking (R1) and Suspense with skeleton fallback (R2).
- **Contract:**
  - `import { lazy, Suspense } from 'react'`.
  - `const PersonDetail = lazy(() => import('./pages/PersonDetail'))` at module top level (outside any component).
  - `<Route path=... element={<Suspense fallback={<Skeleton />}><PersonDetail /></Suspense>} />` inside the existing `Routes`.
  - No `createBrowserRouter`; no `React.lazy`.
- **Files touched:** `client/src/App.jsx`
- **Acceptance:**
  - Network tab shows a separate JS chunk requested only when the route is opened.
  - Skeleton appears first, then `PersonDetail`.
  - Other routes are not lazy (D5).
- **Verification:** DevTools Network (throttle Slow 3G, disable cache), then check `vite build` output lists a separate chunk.
- **Commit:** `feat(router): lazy-load PersonDetail route behind Suspense skeleton`

#### 1.1-08: Verification and checkpoints (no code)
- **Goal:** Prove CLS = 0 and accessibility.
- **Steps:**
  1. DevTools Performance -> Layout Shift track / Lighthouse: CLS = 0 on the route at Slow 3G, at 375px and at desktop width.
  2. Accessibility tree: `aria-busy="true"` while loading; persistent live region present.
  3. Keyboard only: focus order and visible focus work during and after loading.
  4. Console: zero warnings (StrictMode on).
  5. Run the section 13 checkpoints (`git grep` banned patterns, `http://`, `.env`).
- **Files touched:** none (record results in the PR or notes; log any AI defect in `AI_FAILURE_AUDIT.md` with a separate `docs(audit)` commit).
- **Acceptance:** All checks pass; Definition of Done items ticked.
- **Commit:** none (or `docs(audit): log failure #NN` if a defect was found).

### 4. Commit plan summary

| Order | Type | Task |
|---|---|---|
| 1 | docs(spec) | 1.1-01 |
| 2 | chore | P1 |
| 3 | feat | P2 |
| 4 | feat | P3 |
| 5 | feat | 1.1-02 |
| 6 | style | 1.1-03 |
| 7 | feat | 1.1-03 follow-up (apply class in `PersonDetail.jsx`) |
| 8 | feat | 1.1-04 (includes the former 1.1-06) |
| 9 | style | 1.1-05 |
| 10 | feat | 1.1-07 |

No JSX, CSS, and logic are mixed within one commit. The Sprint 1 target (2 feat commits) is not enforced for this exercise; P2/P3 are only the minimum scaffold.

### 5. Open questions

Q1-Q6 are resolved in section 2 (D1-D6). Remaining:

- **Q7 (dependency allow-list):** Vite needs `@vitejs/plugin-react` to compile JSX, and it is not in the allow-list of Sec. 1. Proposed: treat it as part of `vite` and allow it. Confirm before P1.
- **Q8 (`createPortal` in `Skeleton`):** Portaling text into `#live-status` during render is the simplest way to announce without state or effects. If you prefer, the fallback could instead contain visually hidden text with `role="status"` (simpler, but then the live region is not persistent, which Sec. 3 discourages). Default: portal.

---

## Exercises 1.2 and 1.2.1: Declarative Syntax Updates and React Router v7 Layout Architecture

Source: screenshot of Exercises 1.2 & 1.2.1 only (one slide covers both, treated as one set of requirements). No implementation code in this section.

### 1. Requirements extracted from the screenshot

| # | Requirement (from screenshot) | Rule check (project-rules.md) | Current state |
|---|---|---|---|
| R1 | Replace `<Switch>` with `<Routes>` as the top-level container | Sec. 2, Sec. 5 | Done (P3) |
| R2 | Routes use `element={<Layout />}` (JSX passed directly) | Sec. 2 | Done (P3) |
| R3 | Nested layout: parent `<Route path="/" element={<Layout />}>`; children `<Route index element={<Home />} />` and `<Route path="about" element={<About />} />` | Sec. 5 | Partial: parent has no `path`, Home is an inline `<h2>`, no `about` route |
| R4 | `Layout` renders child routes through `<Outlet />` | Sec. 5: inside `<main>`, one root or Fragment | Done (P2) |
| R5 | `NavLink` with callback `className={({ isActive }) => ...}` for active highlighting | Sec. 5: link to `/` uses `end` | Done for Home and Person; no About link |
| R6 | Import `Routes, Route, NavLink, Outlet` from `'react-router'` | Sec. 5 | Done |

Differences between the screenshot code and the rules (the rules win, the screenshot is not copied blindly):
- The screenshot's Home `NavLink` has no `end`. Without it, Home would look active on every route. We keep `end`.
- The screenshot's `Layout` returns `<nav>` and `<Outlet />` as two siblings without a wrapper and without `<main>`. Sec. 5 requires one root or a Fragment, and `Outlet` inside `<main>`. Our existing `Layout` already complies.
- The screenshot uses plain class names `'active'` and `''`. We keep CSS Module classes (Sec. 9).
- The screenshot names the file `App.jsx` (it matches our file). `Home` and `About` are not defined in the screenshot, so they are new page components.

Out of scope: a catch-all/404 route, lazy loading for the new pages, any data fetching, any extra nav items beyond Home, Person, About.

### 2. Decisions

- D1: Treat 1.2 and 1.2.1 as one set. Reuse what exists (R1, R2, R4, R5, R6) and only add what is missing (R3 and the About link).
- D2: `Home` and `About` are separate default-exported components in `client/src/pages/`, each with one `<h2>` and one short fictional sentence. They are eager (not lazy), since lazy loading is not requested here.
- D3: Adopt `path="/"` on the parent route as in the screenshot. Behavior is identical to the current pathless layout route.
- D4: Keep `end` on the Home link (rule over screenshot). Keep the CSS Module active style already in `Layout.module.css`.
- D5: Do not add a `*` route. Unknown URLs are handled by the later "detail route handling" exercise with `NotFoundState`.
- D6: Add an `About` link to the nav after Person. No other nav changes.

### 3. Task list

UI-only exercise: the "fail test" stage is skipped (Sec. 11). Verified with DevTools. The Sprint 1 target of 2 feat commits is already met by the earlier layout and routes commits, so the commit below adds to it.

#### 1.2-01: Contract and WBS
- **Goal:** Freeze the scope above.
- **Files touched:** `TASK_DECOMPOSITION.md`
- **Acceptance:** Committed before any code of this exercise.
- **Commit:** `docs(spec): add WBS for exercises 1.2 and 1.2.1 router layout`

#### 1.2-02: Home, About, nested routes and About link (JSX)
- **Goal:** Complete the declarative layout structure of the screenshot (R3, R5) in one change.
- **Contract:**
  - `Home` (`client/src/pages/Home.jsx`) and `About` (`client/src/pages/About.jsx`): default exports, each a `<section>` with one `<h2>` and one short `<p>`; no `<h1>` (layout owns it).
  - `App.jsx`: parent `<Route path="/" element={<Layout />}>`; children `<Route index element={<Home />} />`, the existing lazy `person` route (unchanged), and `<Route path="about" element={<About />} />`. Only `Routes` and `Route` from `'react-router'`.
  - `Layout.jsx`: add `<li><NavLink to="/about" className={({ isActive }) => ...}>About</NavLink></li>` after Person, same callback pattern; Home keeps `end`.
- **Files touched:** `client/src/pages/Home.jsx`, `client/src/pages/About.jsx`, `client/src/App.jsx`, `client/src/components/Layout.jsx`
- **Acceptance:**
  - `/` shows Home, `/about` shows About, `/person` still shows the lazy `PersonDetail`; direct load and reload of `/about` works.
  - Exactly one link looks active per route; Home is not active on `/about` or `/person`.
  - Headings sequential (`h1` in layout, `h2` in pages); no inline style; no banned router syntax.
- **Verification:** Type each URL in the address bar; Tab and Enter through the nav; Elements panel shows `aria-current="page"` on the active link; `git grep` for banned patterns.
- **Commit:** `feat(router): add home and about routes with nested layout navigation`

#### 1.2-03: Verification (no code)
- **Steps:**
  1. Each route renders inside the same `<main>` through `<Outlet />`; the nav and `h1` do not remount or flicker.
  2. One `<h1>` and one `<main>` on every page.
  3. Active link: visible by more than color (bold and lines already used).
  4. 375px: no horizontal scroll; keyboard only works.
  5. `git grep` checkpoints from Sec. 13.
- **Commit:** none.

### 4. Commit plan summary

| Order | Type | Task |
|---|---|---|
| 1 | docs(spec) | 1.2-01 |
| 2 | feat | 1.2-02 |

### 5. Open questions

All ambiguities are resolved in section 2 (D1-D6). Two points worth a quick confirmation:
- **Q1:** D5 leaves unknown URLs (for example `/abc`) rendering the layout with an empty `main`. Acceptable until the 404 exercise?
- **Q2:** D1 treats the existing Person route as part of this layout unchanged. Confirm you do not want it moved or renamed.

---

## Exercise 1.2.2: Refactoring for Master-Detail Views via React Router and CSS Grid

Source: screenshot of Exercise 1.2.2 only. No implementation code in this section.

### 1. Requirements extracted from the screenshot

| # | Requirement (from screenshot) | Rule check (project-rules.md) |
|---|---|---|
| R1 | Responsive CSS Grid layout: `grid-template-columns: minmax(280px, 1fr) 2fr` | Sec. 5: mobile-first, one column by default, the two-column grid only from a wider breakpoint; no horizontal scroll at 375px. **Conflict**: the slide states the grid without a breakpoint |
| R2 | Safe URL param extraction with `useParams()` | Sec. 5: params are strings |
| R3 | Locate the entity via `people.find(p => p.id === id)`; render a 404 state when the id is invalid | Sec. 5: `NotFoundState` with `role="alert"` and a link back; no crash, no blank page |
| R4 | Detail attributes as a semantic definition list `dl`/`dt`/`dd` | Sec. 3 |

Differences between the screenshot code and the rules (rules win):
- `className="person-details"` is a plain global class. We use a CSS Module (Sec. 9).
- The grid in R1 is applied only from a breakpoint (D4), with a single column below it.
- The snippet shows only the detail component. A two-column master-detail layout needs a master list, which the slide does not show; D3 defines the minimum.
- The snippet defines `PersonDetail` as an arrow-function constant with a `people` prop. Our component must stay a default export so the Ex 1.1 `lazy()` import keeps working; the `people` prop is kept.

Out of scope: search, filters, sorting, pagination, edit forms, any fetching (data is hardcoded), extra fields beyond name and role.

### 2. Decisions

- D1: Data lives in `client/src/lib/people.js`: 5 clearly fictional people `{ id, name, role }` with **string** ids (`'1'` to `'5'`). `App.jsx` imports it and passes it as the `people` prop (as in the snippet).
- D2: Lookup is a pure helper `findPersonById(people, id)` in the same module. It calls `people.find(p => p.id === id)` and returns the person or `undefined`. Pure logic means test-first (Sec. 11).
- D3: Routing. The Ex 1.1 `/person` route is replaced by:
  - `/people` (parent): renders the master-detail shell (`People` page) with the list on one side and `<Outlet />` on the other.
  - `/people` index: a short prompt "Select a person from the list."
  - `/people/:id`: `PersonDetail` inside `<Suspense fallback={<Skeleton />}>`; **still lazy**, so Ex 1.1 behavior is preserved.
  - The nav link "Person" becomes "People" (`to="/people"`, no `end`, so it stays active on child routes).
- D4: Breakpoint `48rem` (768px). Below it: one column. From it: `grid-template-columns: minmax(280px, 1fr) 2fr`.
- D5: The master list is `<nav aria-label="People">` containing a `ul` of `NavLink`s to `/people/{id}` with the callback `className`, `key={person.id}`. This keeps the current person visibly active.
- D6: `NotFoundState` is a component in `client/src/components/`: `role="alert"`, a short message, and a `Link` back to `/people`. It is rendered by `PersonDetail` when the lookup finds nothing (for example `/people/999`).
- D7: `PersonDetail` keeps its fixed box (`--detail-height`, `--detail-max-width`) so the Ex 1.1 skeleton stays dimension-matched (CLS = 0). It now reads `useParams()`, looks the person up, and renders the `dl` (name, role) with `Fragment key` pairs.
- D8: Heading order: `h1` in the layout; `h2` "People" in the master column; `h2` with the person's name in the detail.

### 3. Task list

#### 1.2.2-01: Contract and WBS
- **Goal:** Freeze the scope above.
- **Files touched:** `TASK_DECOMPOSITION.md`
- **Commit:** `docs(spec): add WBS for exercise 1.2.2 master-detail routing`

#### 1.2.2-02: Failing tests for the lookup helper (test stage)
- **Contract:** `findPersonById(people, id)` returns the person whose `id === id` (strict, string compare), otherwise `undefined`; never throws.
- **Test cases (Vitest):**
  1. existing id `'1'` returns that person;
  2. every seeded id is found;
  3. unknown id `'999'` returns `undefined`;
  4. `undefined` id returns `undefined`;
  5. number `1` does not match `'1'` (ids are strings, strict equality);
  6. empty list returns `undefined`.
- **Files touched:** `client/src/lib/people.test.js`
- **Acceptance:** `npx vitest run` fails (module missing). Red is expected.
- **Commit:** `test(people): add failing tests for findPersonById`

#### 1.2.2-03: Data and lookup helper (logic)
- **Contract:** JSDoc typedef `Person { id: string, name: string, role: string }`; `export const PEOPLE` (5 items); `export function findPersonById(people, id)`.
- **Files touched:** `client/src/lib/people.js`
- **Acceptance:** `npx vitest run` is green; no UI code in this commit.
- **Commit:** `feat(people): add fictional people data and findPersonById`

#### 1.2.2-04: Master-detail grid (CSS)
- **Contract:** `People.module.css`: mobile-first, one column with `gap`; at `@media (min-width: 48rem)` `grid-template-columns: minmax(280px, 1fr) 2fr`. Master list as a plain vertical list. Reuse existing tokens; hex colors only in `:root`.
- **Files touched:** `client/src/pages/People.module.css`
- **Acceptance:** Class names `.layout`, `.list` exist and are used by 1.2.2-05; no horizontal scroll at 375px once wired.
- **Commit:** `style(people): add responsive master-detail grid`

#### 1.2.2-05: Master-detail routes, detail lookup and 404 state (JSX)
- **Contract:**
  - `People.jsx` (default export): `section` with `h2`, the `nav` list (D5) and `<Outlet />`, using the `.layout` grid; takes a `people` prop.
  - `NotFoundState.jsx` (D6).
  - `PersonDetail.jsx` refactor (D7): `({ people })`, `useParams()`, `findPersonById`, `NotFoundState` fallback, `dl` with name and role, keeps `styles.detail`.
  - `App.jsx` routes per D3 (the `person` route is removed).
  - `Layout.jsx`: nav link "People" to `/people`.
- **Files touched:** `client/src/pages/People.jsx`, `client/src/components/NotFoundState.jsx`, `client/src/pages/PersonDetail.jsx`, `client/src/App.jsx`, `client/src/components/Layout.jsx`
- **Acceptance:**
  - `/people` shows the list and the prompt; `/people/2` shows that person; `/people/999` shows the 404 state with a working link back; no crash and no blank page.
  - The detail chunk is still separate and the skeleton still shows while it loads (Ex 1.1 intact).
  - Exactly one `h1` and one `main`; list and detail are keyboard reachable; the selected person is highlighted by more than color.
  - No `key={index}`, no inline style, no banned router syntax.
- **Commit:** `feat(router): add master-detail people routes with 404 state`

#### 1.2.2-06: Verification (no code)
- **Steps:**
  1. 375px: one column, no horizontal scroll. 768px and wider: two columns.
  2. Valid id, invalid id (`/people/999`), and the index route all render sensibly; reload on `/people/3` works.
  3. Keyboard only through list and detail; the 404 link is reachable.
  4. Ex 1.1 regression: Slow 3G still shows the skeleton, and CLS stays 0.
  5. `npx vitest run` green; Sec. 13 `git grep` checkpoints clean.
- **Commit:** none.

### 4. Commit plan summary

| Order | Type | Task |
|---|---|---|
| 1 | docs(spec) | 1.2.2-01 |
| 2 | test | 1.2.2-02 |
| 3 | feat | 1.2.2-03 |
| 4 | style | 1.2.2-04 |
| 5 | feat | 1.2.2-05 |

The style commit comes before the JSX commit so the build never references a missing CSS file. The Sprint 1 "detail route handling" feat commit is 1.2.2-05.

### 5. Open questions

All ambiguities are resolved in section 2 (D1-D8). Please confirm two points:
- **Q1:** The slide shows no master list, but a two-column grid needs one. D3 and D5 add the smallest possible list. OK?
- **Q2:** D3 removes the Ex 1.1 URL `/person` and renames the nav link to "People". The lazy loading, Suspense and skeleton from Ex 1.1 stay on `/people/:id`. OK?

---

## Exercise 1.3: Legacy Validation Anti-Patterns (Deconstructing useEffect Chaining)

Source: screenshot of Exercise 1.3 only. No implementation code in this section.

### 1. What the screenshot is

This slide is an **analysis exercise**, not a build exercise. It describes a legacy `InputField` + `SimpleForm` pair that validates through five chained `useEffect` hooks, shows an execution trace of one keystroke, and lists three flaws. It gives **no legacy source code** and **no requirement to build or fix a form**. Per Sec. 0 (scope guard) nothing is implemented here; the form engine belongs to the later Context-form exercises.

Requirements extracted:

| # | Item on the slide | Meaning |
|---|---|---|
| F1 | Cascading re-renders: state synchronization between `InputField` and `SimpleForm` triggers up to 5 redundant render cycles per keystroke | One `onChange` leads to a chain of effects, each calling `setState` and causing another render |
| F2 | Race conditions: rapid typing makes asynchronous effect updates resolve out of order and corrupt state | Late results of an older keystroke overwrite the newer one |
| F3 | Infinite loop risk: mutual state dependencies can trigger `Maximum update depth exceeded` | Parent effect updates child, child effect updates parent, with no stable stopping condition |

Observations about the slide (flagged, not guessed):
- The trace command says `--target Ex1.6`, while the slide is titled Exercise 1.3. The trace belongs to a legacy example that a later exercise refers to. It does not change the scope of 1.3.
- The slide says "5 useEffect hooks" in the heading and the trace lists five (`#1` to `#5`).

### 2. Analysis: reading the execution trace

| Step in the trace | Effect | What it does | Why it is wrong |
|---|---|---|---|
| `onChange('a')`, `InputField` renders (local state) | none | The child keeps its own copy of the value | Two sources of truth for one value |
| `useEffect #1 syncToParent()` | #1 | Copies the child value up with `setState` in the parent | Mirrored state; forces a second render (`SimpleForm`) |
| `useEffect #2 validateField()` | #2 | Computes an error and stores it with `setState` | Validation is derived data; it needs no state |
| `useEffect #3 calcFormValidity()` | #3 | Computes form validity and stores it with `setState` | Derived data again; chained after #2 |
| `useEffect #4 syncErrorsToChild()` | #4 | Pushes errors down to the child with `setState` | Parent-to-child state sync causes the child re-render |
| `InputField re-render (errors)`, `useEffect #5 autoScrollToError()` | #5 | A DOM side effect that depends on the errors state | Only runs after the whole chain; adds a render dependency |
| `CASCADE DETECTED: 5 re-renders / 1 keypress` | n/a | Result of the chain above | The same information could be computed in one render |

Why each flaw happens:
- **F1:** every `setState` inside an effect schedules a new render, and the next effect depends on that render. Five chained effects give a five-step render chain.
- **F2:** an effect that finishes later than a newer keystroke writes stale values, because effects are scheduled after render and nothing cancels the older one.
- **F3:** when the parent effect depends on child state and the child effect depends on parent state, and either writes a new object or array each time, the dependency changes every render, so React stops with `Maximum update depth exceeded`.

### 3. Mapping to the project rules (what replaces each effect)

| Legacy effect | Replacement in this project | Rule |
|---|---|---|
| #1 `syncToParent` | Delete it. One `values` state in `FormProvider`; `InputField` reads and writes through context, with no local copy | Sec. 6, Sec. 4 |
| #2 `validateField` | `errors = validateForm(values)` computed during render | Sec. 2, Sec. 6 |
| #3 `calcFormValidity` | `isValid = Object.keys(errors).length === 0` computed during render | Sec. 6 |
| #4 `syncErrorsToChild` | Delete it. The child reads `errors` from context | Sec. 6 |
| #5 `autoScrollToError` | Not requested by any current exercise; not built (scope guard). If ever needed, it runs in the submit handler, not in an effect | Sec. 0, Sec. 2 |

Resulting target for the later form exercise: one keystroke leads to one `setState` and one render pass. F2 disappears because validation is synchronous and pure (no async, nothing to resolve out of order). F3 disappears because no state is derived from other state.

### 4. Task list

#### 1.3-01: Analysis section (documentation only)
- **Goal:** Record the flaws, the trace walkthrough and the replacement mapping as the contract for the later form exercises.
- **Files touched:** `TASK_DECOMPOSITION.md`
- **Acceptance:** Sections 1 to 3 above are present; no code, no new dependency, no new file.
- **Verification:** `git show --stat` lists only this file.
- **Commit:** `docs(spec): add WBS for exercise 1.3 useEffect validation anti-patterns`

No test, JSX or CSS tasks exist for this exercise. The test stage (Sec. 11) applies to `validateForm`, which belongs to the later form exercise.

### 5. Guard rails carried into the form exercises (not tasks here)

- `git grep -n "useEffect" -- client/src/context client/src/components client/src/lib` should show no effect used for validation or derived data.
- React Profiler (Sec. 13): one keystroke produces one commit of the form tree.
- `validateForm` stays a pure module in `client/src/lib/` with its own Vitest cases (Sec. 6).

### 6. Open questions

- **Q1:** Is the deliverable for 1.3 only this written analysis? Decision: yes, because the slide requests no implementation. If your lab handout asks for a written answer or a legacy demo, send me its text.
- **Q2:** `AI_FAILURE_AUDIT.md` needs at least 3 real, verified AI defects (Sec. 13). It must not be invented from this slide. We will log real defects found during the form exercises, or earlier ones if you have them.

---

## Exercise 1.7.1: Data Fetching and Express Hygiene

Source: screenshot of Exercise 1.7.1 only. No implementation code in this section.

### 1. Requirements extracted from the screenshot

| # | Requirement (from screenshot) | Rule check (project-rules.md) |
|---|---|---|
| R1 | Custom hook `useForumMessages.js`: state logic extracted, `AbortController` signal prevents memory leaks and out-of-order race conditions on fast channel switching | Sec. 7 client hook pattern |
| R2 | Semantic UI: `<React.Fragment key={msg.id}>` inside a definition list `<dl>` | Sec. 3, Sec. 7: named `Fragment` import, text only |
| R3 | CORS middleware in Express via `cors()` | Sec. 7: `cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' })`, then `express.json()`, then routes |
| R4 | Payload security: strict POST payload validation on incoming requests | Sec. 7, Sec. 8, Sec. 10: pure `validateMessage(body)`, whitelist, 400 on failure |

Differences between the screenshot code and the rules (rules win, the screenshot is not copied blindly):
- **No `res.ok` check:** the snippet calls `res.json()` on any response. Sec. 7 requires checking `res.ok` and throwing on non-2xx (it is on the audit watchlist).
- **Errors only go to `console.error`:** there is no error state, so the UI cannot tell the user. Sec. 3 requires `role="alert"` and a way to recover.
- **Hook returns only `msgs`:** no loading or error information. Sec. 7 requires `{ status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR', data, error }` (see D1 and Q1).
- **Relative URL `/api/...`:** Sec. 7 requires the base URL from `import.meta.env.VITE_API_URL`.
- **Aborted results:** the snippet's `AbortError` handling is correct in spirit (silent), and we keep it; we also ignore any result of an aborted request.
- **`import { useState, useEffect }` with a promise chain:** fine, but the 4-state hook is written with `async/await` inside the effect.

Out of scope (not in the screenshot): MongoDB, authentication, a client-side POST form, message editing or deletion, pagination, timestamps in the UI, any dependency beyond the allow-list.

### 2. Decisions

- D1 (hook shape): `useForumMessages(channelId)` returns `{ status, data, error, retry }`. `status` is one of `'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'`. `retry` increments a counter that is part of the effect dependency array. This follows Sec. 7 and the Sec. 3 error rules; the screenshot's bare `msgs` array cannot show loading or errors.
- D2 (hook behavior): inside the effect, create a new `AbortController`; set `status` to `'LOADING'`; `fetch(url, { signal })`; throw if `!res.ok`; on `AbortError` return silently and never set an error; ignore any result when `controller.signal.aborted`; the cleanup calls `controller.abort()`; dependency array `[channelId, attempt]`. The URL is `${import.meta.env.VITE_API_URL}/api/channels/${encodeURIComponent(channelId)}/messages`.
- D3 (server layout): `server/` is an ESM package (`"type": "module"`) with `express` and `cors` only. Files: `server/server.js`, `server/lib/validateMessage.js`, `server/lib/store.js`. Run with `node --env-file=.env --watch server.js` (no `dotenv`, no `nodemon`).
- D4 (API contract, Sec. 8, unchanged): `GET /api/channels/:channelId/messages` returns 200 `[{ id, text, author, timestamp }]` or 404 `{ error }`; `POST` with body `{ text, author }` returns 201 with the created message, 400 `{ error }` for an invalid body, or 404 for an unknown channel. Channels: `nasa`, `esports-tribunal`, `notNasa`.
- D5 (storage): in-memory `Map` seeded with 2 to 3 clearly fictional messages per channel. The server assigns `id` (`crypto.randomUUID()`) and `timestamp` (ISO 8601); the client never chooses them.
- D6 (validation, the same limits as the defaults in Sec. 8): `validateMessage(body)` is pure. It accepts only a plain object, whitelists `text` and `author`, requires both to be strings, trims them, and enforces `text` 1 to 500 and `author` 1 to 50 characters after trim. Every other field is ignored. It returns `{ ok: true, value: { text, author } }` or `{ ok: false, error: '<clear message>' }`.
- D7 (server hardening, Sec. 7 and 10): `express.json({ limit: '10kb' })`; every handler is `async` with `try/catch` and answers `{ error }`; one final error middleware turns a malformed JSON body into 400 `{ error }`; unexpected failures answer 500 `{ error }`.
- D8 (server tests): the test runner for the server is Node's built-in `node --test` (no new dependency). Sec. 1 lists Vitest only for the client; adding it to `server/` needs your approval (Q2).
- D9 (client UI, minimum): a `Forum` page at route `/forum/:channelId`, a `Forum` link in the nav (`to="/forum/nasa"`), a channel `nav aria-label="Channels"` of `NavLink`s for the three channels, and the messages as `<dl>` with `<Fragment key={msg.id}>`: `<dt>` author, `<dd>` text. The status area is a persistent `aria-live="polite"` container that is always mounted; it holds the loading text (`aria-busy="true"` while loading), the `role="alert"` error with a Retry `<button type="button">`, or the list. No client POST form (Q3).
- D10 (env): the repo-root `.env.example` documents `PORT`, `CLIENT_ORIGIN`, `VITE_API_URL` with fake values. `server/.env` and `client/.env` stay git-ignored; you create them from the example.

### 3. Task list

#### 1.7.1-01: Contract and WBS
- **Goal:** Freeze the scope above.
- **Files touched:** `TASK_DECOMPOSITION.md`
- **Commit:** `docs(spec): add WBS for exercise 1.7.1 data fetching and express hygiene`

#### 1.7.1-02: Failing tests for `validateMessage` (test stage)
- **Contract:** D6.
- **Test cases (`node --test`):**
  1. valid body returns `ok: true` with the trimmed `text` and `author`;
  2. surrounding spaces are trimmed;
  3. extra fields (`id`, `timestamp`, `isAdmin`, `__proto__`) are not in `value`;
  4. `null`, an array, a string and `undefined` bodies are rejected;
  5. missing `text` or missing `author` is rejected;
  6. non-string `text` or `author` (number, object) is rejected;
  7. empty or whitespace-only `text` or `author` is rejected;
  8. `text` of 500 characters is accepted, 501 is rejected;
  9. `author` of 50 characters is accepted, 51 is rejected;
  10. the error message is a non-empty string.
- **Files touched:** `server/package.json` (`"type": "module"`, `"scripts": { "test": "node --test", "dev": "node --env-file=.env --watch server.js" }`), `server/lib/validateMessage.test.js`
- **Acceptance:** `npm test` in `server/` fails because the module is missing. Red is expected.
- **Commit:** `test(server): add failing tests for validateMessage`

#### 1.7.1-03: Express API with validation, CORS and in-memory store (logic)
- **Contract:** D3, D4, D5, D6, D7. Middleware order: `cors(...)`, `express.json({ limit })`, routes, error middleware.
- **Files touched:** `server/lib/validateMessage.js`, `server/lib/store.js`, `server/server.js`, `server/package.json` (add `express` and `cors` dependencies), `.env.example`
- **Acceptance:**
  - `npm test` in `server/` is green.
  - `GET` on each channel returns 200 with the seeded messages; an unknown channel returns 404 `{ error }`.
  - `POST` with a valid body returns 201 with a server-assigned `id` and `timestamp`; invalid bodies return 400 `{ error }`; a malformed JSON body returns 400 `{ error }`; an unknown channel returns 404.
  - A `POST` containing `id` or `timestamp` ignores them.
  - Every response carries `Access-Control-Allow-Origin` equal to the configured `CLIENT_ORIGIN` (default `http://localhost:5173`), so a browser page from any other origin is blocked.
  - No `require()`, no hardcoded secrets, no `dotenv`.
- **Verification:** `curl` against the running server for each case above; check the `Access-Control-Allow-Origin` header.
- **Commit:** `feat(server): add express api with cors, validated posts and in-memory store`

#### 1.7.1-04: `useForumMessages` hook (logic)
- **Contract:** D1, D2.
- **Files touched:** `client/src/hooks/useForumMessages.js`, `client/.env` is created locally by you and is not committed.
- **Acceptance:**
  - New `AbortController` per effect run; cleanup aborts; dependency array `[channelId, attempt]`.
  - `res.ok` is checked; non-2xx sets `ERROR`.
  - `AbortError` never sets an error and never updates state.
  - Rapid channel switching: only the latest channel's result is shown; the Network panel shows earlier requests as `canceled`.
  - Survives StrictMode double invocation (no duplicate state flashes, no console warnings).
  - Base URL comes from `import.meta.env.VITE_API_URL`.
- **Verification:** Slow 3G and fast channel switching in DevTools (after 1.7.1-06).
- **Commit:** `feat(forum): add useForumMessages hook with abortable fetch`

#### 1.7.1-05: Forum styles (CSS)
- **Contract:** `Forum.module.css`: mobile-first, flex or grid with `gap`, channel list and messages stacked on 375px; reuse existing tokens; hex colors only in `:root`; no inline style.
- **Files touched:** `client/src/pages/Forum.module.css`
- **Acceptance:** Class names used by 1.7.1-06 exist; no horizontal scroll at 375px once wired.
- **Commit:** `style(forum): add responsive forum layout`

#### 1.7.1-06: Forum page, route and nav link (JSX)
- **Contract:** D9.
- **Files touched:** `client/src/pages/Forum.jsx`, `client/src/App.jsx`, `client/src/components/Layout.jsx`
- **Acceptance:**
  - `/forum/nasa`, `/forum/esports-tribunal` and `/forum/notNasa` show their seeded messages as a `dl` with `Fragment key={msg.id}`.
  - An unknown channel (`/forum/xyz`) shows a `role="alert"` message with a Retry button; the page does not crash.
  - Stopping the server shows the error state; restarting it and pressing Retry recovers.
  - The live container exists before data arrives and is never unmounted; one `h1`, one `main`; heading order sequential.
  - A message whose text is `<img src=x onerror=alert(1)>` (created with `curl`) stays plain text.
  - No `key={index}`, no `dangerouslySetInnerHTML`, no inline style.
- **Commit:** `feat(forum): add forum page with channel switching and error recovery`

#### 1.7.1-07: Verification (no code)
- **Steps:**
  1. `npm test` in `server/` and `npx vitest run` in `client/` are green.
  2. Fast channel switching on Slow 3G: earlier requests show `canceled`, no error is displayed for them, the final list matches the last chosen channel.
  3. Stop the server: the error state shows; restart and Retry recovers.
  4. CORS: the page loads data from `http://localhost:5173` to the server; a page served from another origin cannot read the response, because the returned header never matches it.
  5. Sec. 13 checkpoints: banned-pattern `git grep`, `http://` outside localhost, no tracked `.env`.
  6. Console: zero warnings in StrictMode.
- **Commit:** none.

### 4. Commit plan summary

| Order | Type | Task |
|---|---|---|
| 1 | docs(spec) | 1.7.1-01 |
| 2 | test | 1.7.1-02 |
| 3 | feat | 1.7.1-03 |
| 4 | feat | 1.7.1-04 |
| 5 | style | 1.7.1-05 |
| 6 | feat | 1.7.1-06 |

### 5. Open questions

- **Q1 (hook shape):** The slide's hook returns `msgs` only. D1 returns the 4-state shape from Sec. 7 so the UI can show loading and errors. Sec. 7 allows another shape only when the screenshot specifies one; this is the one real conflict, so please confirm D1.
- **Q2 (server test runner):** D8 uses `node --test` to avoid adding Vitest to `server/` (not in the allow-list). If you prefer Vitest in `server/`, tell me and I will use it instead.
- **Q3 (client POST):** The slide mentions strict POST validation on the server but shows no client form. D9 adds none, so the Sec. 7 client/server parity applies later if a form is added. OK?
- **Q4 (route and nav):** D9 uses `/forum/:channelId` with a nav link to `/forum/nasa`. OK?

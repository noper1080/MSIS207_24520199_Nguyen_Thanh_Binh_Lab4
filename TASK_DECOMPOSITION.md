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

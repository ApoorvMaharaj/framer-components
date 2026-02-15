# Framer UI System Repository Analysis & Scalable Structure Proposal

## Current Repository Analysis

The repository is intentionally minimal and currently defines only high-level direction:

- A clear vision for reusable, modular architecture.
- Core goals around isolation, predictable layout, clean animation, and token reuse.
- No implementation-level folder strategy yet.

This is a good moment to establish conventions before components proliferate.

---

## Recommended High-Level Principles

1. **Package by concern, not by file type only**
   Group files around component domains and runtime boundaries.
2. **Separate primitives from composed components**
   Keep low-level, style-safe building blocks independent from brand/product components.
3. **Token-first design system**
   Route spacing, color, typography, elevation, radius, and motion through semantic tokens.
4. **Variant definitions are data, not ad hoc conditionals**
   Centralize variant contracts and defaults so behavior remains predictable.
5. **Make migration and scale easy**
   Folder strategy should support moving to monorepo packages later without massive churn.

---

## Proposed Scalable Folder Structure

```text
framer-components/
├─ README.md
├─ docs/
│  ├─ architecture/
│  │  ├─ principles.md
│  │  ├─ variant-strategy.md
│  │  └─ contribution-guide.md
│  └─ ui-system-structure-proposal.md
├─ src/
│  ├─ foundation/
│  │  ├─ tokens/
│  │  │  ├─ primitive/
│  │  │  │  ├─ color.ts
│  │  │  │  ├─ spacing.ts
│  │  │  │  ├─ typography.ts
│  │  │  │  ├─ radius.ts
│  │  │  │  └─ motion.ts
│  │  │  ├─ semantic/
│  │  │  │  ├─ light.ts
│  │  │  │  ├─ dark.ts
│  │  │  │  └─ index.ts
│  │  │  └─ index.ts
│  │  ├─ themes/
│  │  │  ├─ createTheme.ts
│  │  │  ├─ defaultTheme.ts
│  │  │  └─ index.ts
│  │  ├─ layout/
│  │  │  ├─ Grid/
│  │  │  ├─ Stack/
│  │  │  └─ Container/
│  │  ├─ motion/
│  │  │  ├─ presets.ts
│  │  │  ├─ transitions.ts
│  │  │  └─ reducedMotion.ts
│  │  └─ index.ts
│  │
│  ├─ primitives/
│  │  ├─ Box/
│  │  │  ├─ Box.tsx
│  │  │  ├─ Box.types.ts
│  │  │  ├─ Box.variants.ts
│  │  │  ├─ Box.styles.ts
│  │  │  ├─ Box.framer.ts
│  │  │  ├─ Box.test.tsx
│  │  │  └─ index.ts
│  │  ├─ Text/
│  │  ├─ Icon/
│  │  ├─ Surface/
│  │  └─ index.ts
│  │
│  ├─ components/
│  │  ├─ inputs/
│  │  │  ├─ Button/
│  │  │  │  ├─ Button.tsx
│  │  │  │  ├─ Button.types.ts
│  │  │  │  ├─ Button.variants.ts
│  │  │  │  ├─ Button.styles.ts
│  │  │  │  ├─ Button.framer.ts
│  │  │  │  ├─ Button.test.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ TextField/
│  │  │  └─ Toggle/
│  │  ├─ navigation/
│  │  │  ├─ Tabs/
│  │  │  ├─ Breadcrumb/
│  │  │  └─ Pagination/
│  │  ├─ feedback/
│  │  │  ├─ Alert/
│  │  │  ├─ Toast/
│  │  │  └─ Progress/
│  │  ├─ overlays/
│  │  │  ├─ Modal/
│  │  │  ├─ Drawer/
│  │  │  └─ Tooltip/
│  │  └─ index.ts
│  │
│  ├─ patterns/
│  │  ├─ CardGrid/
│  │  ├─ PricingSection/
│  │  ├─ Hero/
│  │  └─ index.ts
│  │
│  ├─ framer/
│  │  ├─ property-controls/
│  │  │  ├─ common.ts
│  │  │  └─ controls.ts
│  │  ├─ adapters/
│  │  │  ├─ withTheme.tsx
│  │  │  └─ withMotion.tsx
│  │  └─ index.ts
│  │
│  ├─ utilities/
│  │  ├─ accessibility/
│  │  ├─ styling/
│  │  ├─ animation/
│  │  └─ testing/
│  │
│  ├─ types/
│  │  ├─ variants.ts
│  │  ├─ polymorphic.ts
│  │  └─ tokens.ts
│  │
│  └─ index.ts
│
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ visual/
│
├─ scripts/
│  ├─ generate-component.ts
│  └─ validate-tokens.ts
│
└─ .changeset/ (optional for versioning)
```

---


## Simple Explanation of the Architecture (Layer by Layer)

Think of the system like building with LEGO:

- **foundation/** is the rulebook (colors, spacing, motion, themes).
- **primitives/** are basic bricks (`Box`, `Text`, `Icon`).
- **components/** are reusable widgets built from bricks (`Button`, `Tabs`, `Modal`).
- **patterns/** are bigger sections built from widgets (`Hero`, `PricingSection`).
- **framer/** is the bridge that exposes all of this cleanly to Framer controls.

This order matters because each layer should depend only on layers below it, not above it.

### Why each layer exists

1. **`src/foundation` (design rules and shared system behavior)**
   - **Why:** Keeps tokens and themes in one place so design updates happen once and propagate everywhere.
   - **Justification:** Prevents inconsistent spacing/colors and reduces copy-paste values across components.

2. **`src/primitives` (low-level reusable UI building blocks)**
   - **Why:** Provides stable, tiny building blocks with predictable APIs.
   - **Justification:** Makes higher-level components easier to build and test; promotes consistency and accessibility.

3. **`src/components` (feature-ready reusable components)**
   - **Why:** Houses components teams use directly in products (inputs, navigation, feedback, overlays).
   - **Justification:** Keeps product-facing APIs organized by domain while reusing primitives/tokens underneath.

4. **`src/patterns` (opinionated composition layer)**
   - **Why:** Captures common multi-component layouts and section patterns.
   - **Justification:** Speeds up page assembly and ensures repeated sections are consistent across projects.

5. **`src/framer` (Framer-specific adapters and controls)**
   - **Why:** Isolates Framer integration details from component business logic.
   - **Justification:** Components remain easier to test outside Framer and easier to port to other environments later.

6. **`src/types` and `src/utilities` (cross-cutting contracts/helpers)**
   - **Why:** Centralizes shared type contracts (especially variants) and helper utilities.
   - **Justification:** Reduces duplicate logic and keeps variant definitions predictable across all components.

7. **`tests/` and `scripts/` (quality and scale tooling)**
   - **Why:** Keeps validation and scaffolding outside runtime source directories.
   - **Justification:** Enables long-term scale with generator workflows, token checks, and visual/unit/integration tests.

---

## Trade-offs of This Structure (and How to Manage Them)

1. **More folders and files upfront**
   - **Trade-off:** Small components may feel "over-structured" early on.
   - **Mitigation:** Start with a slim subset (foundation + primitives + a few components) and add layers as needed.

2. **Slightly higher onboarding cost**
   - **Trade-off:** New contributors need to learn where responsibilities live.
   - **Mitigation:** Keep a short `contribution-guide.md` and use a component generator script for consistency.

3. **Variant logic split across multiple files**
   - **Trade-off:** You gain clarity, but it can feel verbose (`types` + `variants` + `styles`).
   - **Mitigation:** Use clear naming conventions and colocated files per component to keep navigation intuitive.

4. **Stricter dependency boundaries require discipline**
   - **Trade-off:** Teams cannot "quickly patch" by importing from higher layers.
   - **Mitigation:** Add lint rules for dependency direction and architecture checks in CI.

5. **Potential duplication between patterns and components**
   - **Trade-off:** A pattern can accidentally become a hidden component library.
   - **Mitigation:** Define clear rules: components are reusable primitives/widgets, patterns are page-level compositions.

6. **Framer isolation adds adapter maintenance**
   - **Trade-off:** Maintaining `*.framer.ts` and shared property controls adds files to maintain.
   - **Mitigation:** Centralize common property control helpers and keep adapters thin.

7. **Future package extraction readiness adds present-day ceremony**
   - **Trade-off:** Designing for package boundaries now adds naming/export discipline early.
   - **Mitigation:** Keep exports simple and only enforce packaging conventions that already provide immediate value.

In short: this structure intentionally trades some short-term simplicity for long-term predictability, safer scaling, and easier collaboration.

---
## Why This Structure Scales

### 1) Strong Layering Boundaries

- **foundation/**: global design language and runtime rules.
- **primitives/**: low-level reusable elements with narrow APIs.
- **components/**: product-level reusable UI building blocks.
- **patterns/**: opinionated compositions for page sections.

This keeps refactors localized and prevents component sprawl.

### 2) Variant Support by Contract

For each component, variant behavior should be split into:

- `*.types.ts` → the public variant API contract.
- `*.variants.ts` → allowed variant matrix + defaults + compound rules.
- `*.styles.ts` → mapping of variant state to style tokens.
- `*.framer.ts` → Framer-specific property control exposure.

This avoids burying variant logic in single giant component files.

### 3) Framer Runtime Isolation

By putting Framer-specific integration under:

- `src/framer/*`
- component-local `*.framer.ts`

...core component logic can stay framework-agnostic and easier to test.

### 4) Token Governance

Use two token tiers:

- **primitive tokens** (raw values)
- **semantic tokens** (role-based, theme-aware)

Components consume semantic tokens, not raw values, which stabilizes API over time.

### 5) Clear Growth Path

If the repository grows, this structure can be extracted into packages with low friction:

- `@ui/foundation`
- `@ui/primitives`
- `@ui/components`
- `@ui/framer`

---

## Component Folder Contract (Template)

Use this per component to enforce consistency:

```text
ComponentName/
├─ ComponentName.tsx
├─ ComponentName.types.ts
├─ ComponentName.variants.ts
├─ ComponentName.styles.ts
├─ ComponentName.framer.ts
├─ ComponentName.test.tsx
└─ index.ts
```

### Rules

- `ComponentName.tsx` should be orchestration only (props → variant resolver → render).
- No hard-coded colors/spacing inside component files.
- All variant keys should be typed and centrally exported.
- `index.ts` should export only public API.

---

## Suggested Implementation Phases

1. **Phase 1: Foundation baseline**
   - Establish `src/foundation/tokens`, theme creation, and base primitives (`Box`, `Text`).
2. **Phase 2: Variant infrastructure**
   - Add shared variant utility types and rules for defaults/compound variants.
3. **Phase 3: First reusable components**
   - Build `Button`, `TextField`, `Tabs` using strict folder contract.
4. **Phase 4: Framer integration hardening**
   - Standardize property controls + wrappers under `src/framer`.
5. **Phase 5: Test + release process**
   - Introduce visual regression checks and optional changesets.

---

## Maintainability Guardrails

- Add lint checks preventing direct primitive token usage in component layers.
- Add architecture docs for dependency direction (components may depend on primitives; primitives may not depend on components).
- Add a generator script (`scripts/generate-component.ts`) to enforce folder contract.
- Keep each directory with a clear `index.ts` boundary for controlled exports.

---

## Simplified V1 Folder Structure (Solo Developer Optimized)

For a solo developer, use a smaller structure that keeps the same architectural intent but reduces file overhead:

```text
framer-components/
├─ README.md
├─ docs/
│  └─ ui-system-structure-proposal.md
├─ src/
│  ├─ foundation/
│  │  ├─ tokens.ts
│  │  ├─ theme.ts
│  │  └─ motion.ts
│  ├─ primitives/
│  │  ├─ Box.tsx
│  │  ├─ Text.tsx
│  │  └─ index.ts
│  ├─ components/
│  │  ├─ Button/
│  │  │  ├─ Button.tsx
│  │  │  ├─ variants.ts
│  │  │  ├─ framer.ts
│  │  │  └─ index.ts
│  │  ├─ TextField/
│  │  │  ├─ TextField.tsx
│  │  │  ├─ variants.ts
│  │  │  ├─ framer.ts
│  │  │  └─ index.ts
│  │  └─ index.ts
│  ├─ framer/
│  │  ├─ propertyControls.ts
│  │  └─ index.ts
│  ├─ utils/
│  │  ├─ variants.ts
│  │  └─ a11y.ts
│  └─ index.ts
├─ tests/
│  └─ components/
└─ scripts/
   └─ generate-component.ts
```

### Why this v1 is better for solo development

- Fewer directories to navigate while working quickly alone.
- Keeps the most important boundaries: `foundation -> primitives -> components -> framer`.
- Uses a lightweight component contract (`Component.tsx`, `variants.ts`, `framer.ts`) instead of many split files.
- Preserves a clean upgrade path to the full structure later without major rewrites.

### Suggested v1 guardrails

- Limit v1 component count to a focused core set (for example: `Button`, `TextField`, `Tabs`, `Modal`).
- Introduce one new top-level folder only when at least 3 components need it.
- Split a component into `types/styles/tests` files only when complexity clearly justifies it.

---

## Recommendation for This Repository Right Now

Given current early-stage status, start with:

- `src/foundation`
- `src/primitives`
- `src/components/inputs/Button`
- `src/framer`
- `src/types`

Then scale into domain subfolders (`navigation`, `feedback`, `overlays`) as coverage grows.

This gives a lean start while preserving long-term architecture stability.

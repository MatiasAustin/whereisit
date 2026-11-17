# DESIGN.md — WhereIsIt Studio Frozen Design System

> **Status:** FROZEN (Production Lock — 16 Nov 2026)  
> **Rule:** Antislop is a filter, not a beautifier. It must NEVER invent a new look, change the palette, introduce new fonts, or alter layout/copy. Every change must pass antislop against this document.

---

## 1. Brand Identity & Aesthetic Direction

- **Studio:** WhereIsIt — Jakarta & Kab. Karawang 3D Design & Objects Studio
- **Positioning:** Transforms personal data, achievements, and everyday routines into meaningful physical products.
- **Tagline:** *Personal data. Physical products. Meaningful experiences.*
- **Visual Language:** Calm, architectural, tactile, warm studio lighting, dusty slate blue accents over warm bone alabaster surfaces.
- **Dial:** `ENERGY 2 / RHYTHM 2 / MOTION 2`
- **Design Read:** Reading this as: bespoke 3D running-memorabilia studio storefront & pre-order platform for Indonesian runners and collectors, in a calm architectural dusty-slate-and-alabaster language, dial `ENERGY 2 / RHYTHM 2 / MOTION 2`.

---

## 1.1 Purpose & Decision Log (R-31 Compliance)

- **Why this color palette?** Warm bone alabaster (`#F8F6F1`) evokes physical studio plaster and daylight, while dusty slate blue (`#5C7489`) and dark charcoal (`#14191F`) anchor technical 3D-printed precision without sterile white or neon tech clichés.
- **Why this layout?** Asymmetric editorial hero paired with structured 4-step pre-order flow, 3-variant comparison, and live tabular production queue directly serve the physical custom-manufacturing workflow.
- **Why this typography?** Clean geometric sans-serif ensures rapid scannability on 390px mobile screens (Threads traffic), while `font-mono` isolates Order IDs (`WSI-YYYYMMDD-XXXX`), layer thickness (`0.12mm`), and Strava telemetry (`KM`, `Pace`, `Duration`).
- **Why this spacing?** Generous vertical section padding (`py-14 sm:py-20`) separates distinct cognitive stages (discovery, proof, specification, live queue, FAQ) while compact card padding keeps mobile viewports scannable.
- **Why use cards?** Cards group individual Shopee variations (`10x5 cm`, `10x5 cm Emoney`, `10x5 cm Flazz`) and narrative phases into distinct selectable units with clear tactile boundaries (`border-[#ECE6DC]`).
- **Why these icons & visuals?** Only real Shopee product photographs (`keychain-04.jpg`, `keychain-05.jpg`, `keychain-06.jpg`) and functional directional/status icons are used to ground trust in physical manufacturing.

---

## 2. Frozen Color Tokens

### Backgrounds & Surfaces (Warm Bone / Alabaster)
- **Primary Canvas:** `#F8F6F1`
- **Elevated Card / Soft Surface:** `#FAF8F5`
- **Secondary Warm Section:** `#F2EDE4` / `#F4EFEA`
- **Pure Contrast Card:** `#FFFFFF`
- **Dark Architectural Surface:** `#14191F`
- **Dark Secondary Surface:** `#182027`

### Brand Accents (Dusty Slate Blue)
- **Primary Slate Accent:** `#5C7489`
- **Hover Slate Accent:** `#6D879E`
- **Deep Slate Text / Badge:** `#3E5161`
- **Light Slate Highlight (Dark Mode):** `#8BA1B4`
- **Soft Slate Tint Background:** `#EDF3F7`
- **Soft Slate Border:** `#C5D5E2`

### Typography & Ink Hierarchy
- **Primary Ink (Headings & Body):** `#14191F`
- **Secondary Body Copy:** `#44505C` / `#556473`
- **Muted / Caption / Metadata:** `#7A8B99` / `#8E9FAA`

### Borders & Dividers
- **Primary Hairline Border:** `#ECE6DC`
- **Card / Input Border:** `#E8E2D7` / `#DDD5C7`
- **Dark Surface Border:** `#232D37` / `#26333E`

### Semantic Status Colors
- **Success / Active Tap:** Emerald (`#059669`, `#10B981`, `#ECFDF5`)
- **Warning / Incomplete Data:** Amber (`#B45309`, `#FEF3C7`, `#FDE68A`)
- **Error / Guard Block:** Red (`#B91C1C`, `#FEF2F2`, `#FECACA`)

---

## 3. Typography & Hierarchy

- **Font Stack:** System UI / clean geometric sans-serif (`antialiased`) + monospace (`font-mono`) for Order IDs, layer specs (`0.12mm`), and Strava telemetry metrics.
- **Headings:** Tight tracking (`tracking-tight`), bold/black weights for product hero statements, light/regular for editorial philosophy headers.
- **Labels & Badges:** Uppercase micro-labels (`text-[10px]` to `text-xs`), wide tracking (`tracking-wider` / `tracking-widest`), bold weight.

---

## 4. Layout, Spacing & Radii

- **Container Max Width:** `max-w-7xl` (`max-w-6xl` / `max-w-5xl` / `max-w-4xl` for focused reading and forms), horizontal padding `px-4 sm:px-6 lg:px-8`.
- **Mobile-First Target:** `390px` viewport must render with zero horizontal overflow, legible typography, and accessible sticky bottom CTA bar where applicable.
- **Border Radius Scale:**
  - Cards & Containers: `rounded-2xl` / `rounded-3xl`
  - Primary Buttons & Pills: `rounded-full` or `rounded-2xl`
  - Badges & Tags: `rounded-full` or `rounded`

---

## 5. Motion & Antislop Constraints

Allowed motion is strictly limited to **4 places**:
1. **Global Smooth Scroll:** Lenis (`lenis/react`), automatically disabled under `prefers-reduced-motion: reduce`.
2. **Section Scroll Reveals:** `BlurFade` / `InView` (`transform` & `opacity` only, stagger max `0.08s`, duration max `0.6s`, `ease-out`).
3. **Number Count-Up:** `NumberTicker` / `AnimatedNumber` on live queue stats and verified social metrics (`88.2K` views).
4. **Subtle Card & Primary CTA Hover:** Subtle spotlight/tilt on product/variation cards (`MagicCard` / `Tilt`) and subtle magnetic pull on primary CTA (`Magnetic`).

### Hard Exclusions (Banned Slop Patterns)
- NO purple/neon gradients, NO rainbow shimmer buttons, NO particle/stars backgrounds, NO WebGL/Three.js globes, NO hyperspeed/cursor trails.
- NO animations on checkout form inputs or `/track` status steps (must remain instant and functional).
- NO invented product names, prices, testimonials, review counts, or stock running photos.

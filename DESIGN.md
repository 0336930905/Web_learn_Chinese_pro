# Design System Specification: The Zen Scholar

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Curator"**
Education often feels cluttered and overwhelming. This design system rejects the "noisy classroom" aesthetic in favor of a high-end, editorial experience. We treat language learning as a curated journey rather than a data dump. 

By utilizing **intentional asymmetry**, **exaggerated white space**, and **tonal depth**, we move away from the rigid, "boxed-in" look of traditional LMS platforms. The goal is to create a "Zen Scholar" environment: a space that feels as premium as a physical boutique stationery store, yet as approachable as a personal tutor.

---

## 2. Colors & Surface Philosophy
The palette is rooted in an organic "Emerald Growth" theme. We avoid harsh contrasts to reduce cognitive load during long study sessions.

### Surface Hierarchy & Nesting
We abandon the flat grid. Instead, we use **Tonal Layering**. Think of the UI as sheets of fine rice paper stacked atop one another. 
- **Base Layer:** `surface` (#f8faf8) for global backgrounds.
- **Content Blocks:** `surface-container-low` (#f2f4f2) for large sectioning.
- **Focus Elements:** `surface-container-lowest` (#ffffff) for the "hero" cards or active learning modules to create a soft, natural lift.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. 
- Separation must be achieved via **Background Shifts** (e.g., a `surface-container-high` card resting on a `surface` background).
- Boundaries are felt, not seen. This creates a fluid, uninterrupted flow of information.

### The "Glass & Gradient" Rule
To inject "soul" into the professional layout, use **Signature Textures**:
- **CTA Depth:** Primary buttons should use a subtle linear gradient: `primary` (#006e10) to `primary-container` (#4ce64c) at a 135° angle.
- **Glassmorphism:** For floating navigation or progress overlays, use `surface` at 80% opacity with a `24px` backdrop-blur. This keeps the user connected to the content beneath.

---

## 3. Typography: The Lexend Scale
Lexend was designed specifically to reduce visual stress and improve reading speed—perfect for the complex task of learning Chinese characters.

| Role | Token | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | 600 | Editorial moments; big achievement numbers. |
| **Headline** | `headline-md` | 1.75rem | 500 | Lesson titles; creates a friendly, open entry point. |
| **Title** | `title-lg` | 1.375rem | 600 | Card headers and primary navigation nodes. |
| **Body** | `body-lg` | 1rem | 400 | The workhorse. Highly legible for pinyin and definitions. |
| **Label** | `label-md` | 0.75rem | 500 | Uppercase with 0.05em tracking for metadata/tags. |

**Editorial Note:** Use `display-sm` for Chinese characters (Hanzi) to give them the physical "weight" and respect they deserve as the focal point of the platform.

---

## 4. Elevation & Depth
We define importance through **Ambient Light**, not structural shadows.

*   **The Layering Principle:** Place `surface-container-lowest` elements on top of `surface-container` to create "Natural Lift."
*   **Ambient Shadows:** For floating elements (Modals/Poppers), use a multi-layered shadow:
    *   `box-shadow: 0 10px 40px -10px rgba(25, 28, 27, 0.08);`
    *   The shadow is tinted by the `on-surface` color to ensure it looks like a natural occlusion of light rather than "dirty" grey.
*   **The Ghost Border Fallback:** If accessibility requires a border (e.g., in Dark Mode), use `outline-variant` at **15% opacity**. Never use 100% opacity borders.

---

## 5. Components

### The "Hero" Card
The cornerstone of this system. 
- **Shape:** `xl` (3rem) corner radius for external edges; `md` (1.5rem) for internal nested elements.
- **Style:** No borders. Use `surface-container-low` background. 
- **Interaction:** On hover, transition to `surface-container-high` with a subtle `2px` upward translation.

### Interactive Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`). `full` (9999px) roundedness. 
- **Tertiary:** No background, `primary` text. Use for "Skip" or "Secondary Info."
- **Feedback:** Upon "Correct" answer, the button should pulse with a `primary-fixed` glow.

### Character Chips
- **Style:** Used for radicals or vocabulary tags.
- **Visuals:** `surface-variant` background, `sm` (0.5rem) roundedness.
- **Constraint:** Forbid dividers between chips; use `8px` horizontal spacing.

### Inputs (The Writing Pad)
- **State:** Active state should not use a border change; instead, use a `surface-bright` background and a `2px` thick `primary` underline (the "Editorial Underline").

### Contextual Components (The "Flash-Flow" Deck)
For the vocabulary deck, use a **Stacked Card** layout where trailing cards are visible at the top (asymmetry). Use `surface-dim` for the background cards to indicate they are in the "past" or "future" of the deck.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. If a header is left-aligned, let the body text be indented further to create a sophisticated, magazine-style layout.
*   **Do** use `primary-fixed-dim` for "Soft Success" states rather than a jarring bright green.
*   **Do** embrace white space. If a screen feels "empty," it’s working. Focus is the goal.

### Don't
*   **Don't** use 1px dividers. If you need to separate content, use a `32px` vertical gap or a subtle color shift to `surface-container-lowest`.
*   **Don't** use standard "drop shadows." If it looks like a 2010 web app, the shadow is too dark or too tight.
*   **Don't** use sharp corners. Everything in this system should feel "huggable" and safe for a learner. Minimum radius is `sm` (0.5rem).

---

## 7. Dark Mode Strategy
In Dark Mode (`#112111`), the hierarchy remains the same, but the "Glass" effect becomes more prominent. 
- **Surface Elevation:** Instead of getting lighter, surfaces in dark mode should use the `surface-container` tiers to shift slightly more toward the `emerald` hue, creating a "deep forest" feel that is easy on the eyes for late-night study sessions.
- **Text:** Use `on-surface-variant` (#3d4a39) for secondary text to maintain a low-contrast, premium feel.
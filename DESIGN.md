# Design System Document

## 1. Overview & Creative North Star
### Creative North Star: "The Living Scroll"
This design system rejects the clinical, static nature of traditional educational software. Instead, it embraces **"The Living Scroll"**—a philosophy that treats the UI as a fluid, organic journey. By combining a "vivid green" vitality with hyper-rounded geometry, we transform Chinese character analysis from a chore into an exploration.

We break the "template" look by utilizing **intentional asymmetry** and **tonal layering**. The layout should feel like a collection of organized thoughts floating on a fresh, airy canvas. We avoid rigid grids in favor of dynamic clusters, where Lexend’s geometric clarity provides the anchor for high-energy, playful interactions.

---

## 2. Colors & Surface Logic
The palette is rooted in a lush, generative green (`primary`) paired with a soothing, minty `background`. We use `secondary` (ochre/orange) and `tertiary` (deep blue) as functional accents for character categories (e.g., Radicals vs. Phonetics).

### The "No-Line" Rule
**Traditional borders are strictly prohibited.** To define sections, designers must rely exclusively on background shifts. A section should be distinguished by moving from `surface` (#dcffe5) to `surface-container-low` (#c7fdd8). This creates a sophisticated, "app-like" feel that mimics physical materials rather than wireframes.

### Surface Hierarchy & Nesting
Treat the interface as a series of nested, organic shapes:
1.  **Level 0 (Base):** `surface` — The infinite canvas.
2.  **Level 1 (Section):** `surface-container` — Large areas for content grouping.
3.  **Level 2 (Interaction):** `surface-container-highest` — For cards that demand immediate focus.

### The Glass & Signature Textures
*   **Signature Gradient:** For primary CTAs and Hero moments, use a linear gradient from `primary` (#006a28) to `primary-container` (#5cfd80) at a 135° angle. This adds "soul" and a sense of growth.
*   **Frosted Glass:** For floating navigation or modals, use `surface_container_lowest` at 80% opacity with a `24px` backdrop blur. This prevents the UI from feeling "heavy."

---

## 3. Typography
We use **Lexend** exclusively. Its hyper-legible, geometric construction reduces cognitive load, which is essential when a student is simultaneously processing complex Chinese glyphs.

*   **Display (lg/md):** Used for single Chinese characters or "Aha!" moments. These should feel monumental and heroic.
*   **Headline (sm/md):** Used for lesson titles. Use `on_surface` with tight tracking (-2%) to feel modern and "editorial."
*   **Body (lg/md):** Used for radical explanations and etymology. Ensure generous line-height (1.6) to allow the "fresh" background to breathe through the text.
*   **Label (sm/md):** All-caps for metadata (e.g., HSK Levels). Use `on_surface_variant` to keep them subordinate to the main content.

---

## 4. Elevation & Depth
Depth is not a shadow; it is a **Tonal Shift.**

*   **The Layering Principle:** To lift a card, place a `surface-container-lowest` (#ffffff) object on top of a `surface-container` (#bbf6ce) background. The contrast in brightness provides all the "lift" required.
*   **Ambient Shadows:** If a floating element (like a FAB) requires a shadow, use a 24px blur with 6% opacity, tinted with `on_surface` (#06361f). Never use pure black shadows.
*   **The Ghost Border:** For high-density data where separation is difficult, use a 1px stroke of `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards (The Core Unit)
Cards must use the `xl` (3rem/48px) corner radius. Forbid the use of divider lines. Separate "Character," "Pinyin," and "Meaning" sections within a card using vertical whitespace (32px+) or a subtle shift to `surface_variant`.

### Buttons
*   **Primary:** Rounded `full`. Gradient fill (Primary to Primary-Container). Shadowless.
*   **Secondary:** `surface_container_high` background with `on_primary_container` text.
*   **State:** On hover, scale the button to 105% rather than changing the color. This maintains the "high-energy" vibe.

### Character Chips
Used for displaying radicals. Use `tertiary_container` for the background and `3xl` corners. These should feel like "gems" or "tokens" the user has collected.

### Input Fields
Avoid the "box" look. Use `surface_container_low` with a thick 2px `outline` that only appears on `:focus`. The placeholder text should be in Lexend `body-md`.

### Progress Visualization
Instead of a flat bar, use a series of `primary` colored organic "blobs" that fill up. This aligns with the "Living Scroll" concept.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. A card might have 40px padding on the top/bottom but 32px on the sides to create a dynamic "editorial" feel.
*   **Do** lean into the `3xl` (3rem) corner radius for all major containers.
*   **Do** use `primary_fixed` for success states instead of a generic bright green.

### Don’t:
*   **Don’t** use 1px solid black or grey lines. Ever.
*   **Don’t** use standard "Material Design" shadows. They are too heavy for this "Fresh/Vibrant" aesthetic.
*   **Don’t** cram content. If a screen feels full, increase the `surface` spacing. This tool should feel as breathable as a park.
*   **Don’t** use sharp corners. Anything less than `1rem` radius is considered an error in this system.
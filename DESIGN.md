# Site-wide interface design

## Direction

Keep the site's existing warm, quiet editorial feel. The Projects page should read like a portfolio index: restrained framing around the project screenshots, clear titles, concise descriptions, and a single obvious action. Carry the same restrained rounded corners through every page so the site feels coherent without looking pill-shaped or overly soft. Project cards and dialogs use DaisyUI components so their surfaces and controls follow the site's light and dark themes.

The current palette and typography in `frontend/src/app.css` are the source of truth. The light page uses warm off-white, near-black text, white surfaces, and forest green accents. Dark mode keeps the same roles with charcoal surfaces and a lighter green accent. `html[data-theme]` already switches these values; DaisyUI receives them through `--color-base-100`, `--color-base-200`, `--color-base-300`, `--color-base-content`, `--color-primary`, and `--color-primary-content`.

## Tokens

- Page background: `base-200`, mapped to the site's warm paper background.
- Card and dialog surface: `base-100`, mapped to the site's white or charcoal surface.
- Main text: `base-content`, mapped to the existing foreground.
- Borders and quiet fills: `base-300` and `base-200`.
- Interactive accent and focus: `primary`, mapped to the existing forest green accent.
- Accent foreground: `primary-content`.
- Typography: existing Inter system stack from `--font-sans`.
- Shape: global compact radius scale. DaisyUI `--radius-box` is 0.75rem for cards, modal boxes and larger panels. `--radius-field` and `--radius-selector` are 0.5rem for buttons, fields, badges, menu items and compact image frames. In Tailwind, use `rounded-xl` for box surfaces and `rounded-lg` for fields and controls. Carousel dots and the timeline marker remain circular by design. This scale is set in `frontend/src/app.css` for both themes.

## Layout

- Container: 1280 px maximum for Projects content; 20 px side padding on phones, 32 px at tablet width, and 48 px at wide desktop.
- Grid: one column at 390 px, two columns at 768 px, three columns at 1280 px. Cards span one column. The intro spans the full container.
- Gutters: 24 px between cards on phones and tablets, 28 px on desktop. Use a 4 px spacing rhythm: 8 px within small groups, 12 px between card details, 24 px card padding and grid gaps, and 56 px from intro to grid.
- Sections in order: a left-aligned page title and short introduction; a responsive grid of project cards. Each card shows a 16:9 image, title, short description, type badge, site link or muted dash, and a visible “View details” cue. On phones the same order remains in one column.
- Project detail: a centered dialog up to 1120 px wide and 680 px tall. At desktop widths the 16:9 image occupies the left 58% and the content panel the right 42%; only the content panel scrolls if needed. At mobile widths the image and details stack, and the dialog can scroll vertically.
- Hierarchy: the project title leads each card, with the image as its visual anchor. The card action is visible without scrolling within the card. Body copy stays at a readable line length of about 45 to 75 characters. Interactive targets are at least 44 px.
- Alignment: page title, intro, grid, card copy, and modal content align to the same left edge. Cards in a row share image ratio and padding. The dialog image is centered in its panel without cropping.

The existing project grid and `PageShell` established the page's responsive behavior. The card hierarchy follows the brief's requested image, description, type, and site sequence, with the project title and details cue added so each card is easy to scan and activate. The two-column dialog follows the existing credential viewer's image-first pattern while honoring the requested right-panel scrolling behavior.

## Components and states

- `ProjectCard`: DaisyUI `card`, `card-body`, and `figure`. A full-card button is the stretched click target; the site link sits above it as its own link.
- `ProjectModal`: native dialog using DaisyUI `modal`, `modal-box`, and `modal-backdrop` conventions. It closes with Escape, the close button, or the backdrop and restores focus to the card button.
- `ProjectImageCarousel`: a labeled DaisyUI carousel region with 16:9, uncropped slides. Navigation and slide selectors appear only when more than one image exists.
- `TechBadge`, `TechList`, `KindBadge`, and `SiteLink`: shared single-purpose elements. A missing site is a plain muted dash. A missing technology value is plain muted text.
- Loading image: retain `MediaImage`'s existing placeholder and lazy loading. Broken image handling remains the existing component's responsibility.
- Empty collection: retain the page's current project data behavior. No new empty state is needed for the fixed portfolio content.
- Keyboard and motion: visible focus ring, native dialog focus handling, arrow-key image navigation, 44 px controls, and reduced-motion utilities. No auto-advancing animation.

## Assets needed

No new image assets are needed for this pass. Reuse the existing project cover images and their prepared WebP sizes from `frontend/public/images/projects/`. These are product screenshots, so a generated stand-in would misrepresent the owner's work. Technology marks use the existing Simple Icons mapping where available and original monochrome path drawings for missing marks.

## Scope

This radius scale applies across home, about, experience, projects, blog, credentials, gallery, footer, desktop and mobile navigation, and the development-only role match panel. Keep avatar circles, carousel dots and the timeline marker circular. Keep `MediaImage.svelte` generic; round its frame at the call site with an overflow-hidden wrapper or rounded utility.

## Radius review notes

Text links use `rounded-lg` with a small horizontal inset so the shared focus-visible outline follows the field radius instead of forming square corners. This applies to About social and download links, the contents navigation, and blog list links. Timeline links inherit the same shared focus outline. The carousel `join` wrapper owns the selector group's radius; its `join-item` buttons remain unrounded so they read as one control. Loading skeletons and inline code use `rounded-lg`. Card imagery relies on the card's `rounded-xl` outer clipping rather than a second radius on its figure.

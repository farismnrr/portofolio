# Ok kita fokus di portofolio. Ikuti guide gw aja ya. Gw nau n…

Task: 06b48b6a63cb3571a5e6193ddaea648d
Status: working
Updated: 2026-10-22T11:20:39Z

Reference material; confirm applicability before reusing.

Scope: **medium**. The card and modal are new UI. Removing the detail pages touches routes, SEO, prerender checks, guards, links and one workflow step. I did not change any file.

**Out of scope:** new project photos or screenshots, a new database field, redesigning other pages, and editing production or release workflows beyond the fast route check.

## Assumptions
- Stack: keep Svelte, TypeScript, Vite and the Rust server, as they are.
- The look stays as the site already is.
- **Personal or Professional** has no field today, so I propose this mapping. Please check it:

| Project | Label | Why |
|---|---|---|
| Sensio Notes | Professional | PT Perkasa Pilar Utama |
| Sensio IoT | Professional | PT Perkasa Pilar Utama |
| AI Workspace | Personal | Category says "Personal" |
| Portfolio website | Personal | Your own site |
| Multitenant user management | Personal | Solo project |
| IoTnet | Personal | Solo project; **unclear** |
| Masih Awam LMS | Personal | Learning project; **unclear** |
| Parentify | Personal | Bangkit capstone; **unclear** |
| GiziLens | Personal | DBS capstone; **unclear** |
| Askin | Personal | Ruangguru learning project; **unclear** |

  - I would store the label as one new `kind` line in each project file, so you can change it by hand later.
  - Capstone and learning projects are the unclear ones. Treat them as Personal unless you say otherwise.
  - IoTnet and Masih Awam LMS might be client or company work.
- **Carousel:** each project has only one cover image. With one image the modal shows it with no arrows. The carousel works as soon as a project lists more images, with arrows and dots.
- **Old links:** `/projects/:slug` redirects to `/projects`.
- **Bullets:** shown as "what I did", taken from the bullet lists in each project's text. Where a project has none, the modal shows "-". Visible copy has no em dashes.
- **Missing data:** any empty field shows "-". That includes the site address when both the product and repository links are empty. The card shows the product link first, then the repository link.

## Done when
1. `/projects` shows cards in this order: small image, short description, Personal or Professional, then the site address or "-". Clicking a card opens a modal with the carousel, name, "what I did" bullets, tech stack, Personal or Professional, and the site. The modal closes with Esc, the close button, or a click outside it.
2. `/projects/askin` and the other old addresses redirect to `/projects`. No file under `frontend/`, `server/` or the fast workflow still points at a detail page, and `ProjectDetailPage` and `ProjectHero` are gone.
3. The fast checks pass: the architecture guard, content check, writing-style guard, Svelte and TypeScript diagnostics, production build with prerender and SEO verification, and the Rust format, clippy and tests.

## Todo (each step leaves the site working)
1. **Developer:** add a `kind` field (Personal or Professional) to the 9 project files using the mapping above. Add an optional `images` list. Normalise the contribution bullets and "-" fallbacks in `project-content.ts` and `project-markdown.ts`. Verify: the type check passes and a quick read shows all 9 projects with a label and bullets or "-".
2. **Developer:** build the project modal with its carousel, based on the native dialog in `CredentialViewer.svelte`. Verify: it opens from a test card, the single-image case has no arrows, and Esc closes it.
3. **Developer:** redo `ProjectCard` and `ProjectsPage` in the new card layout, and open the modal on click. Verify: all 9 cards show "-" where the site is empty.
4. **Developer:** remove the detail pages and every link to them, then add the redirect. This covers:
   - `routes.ts` and `seo.ts`
   - `generate-seo-assets.mjs`, `verify-prerender.mjs` and `guard-ui.mjs`
   - `TimelineEntry.svelte` and `cv.ts`
   - `server/src/role_match.rs` and its fixtures in `server/src/cv.rs`
   - the route check in the fast workflow

   Update README and AGENTS.md wording where they mention these pages. Keep the existing edits in `router.ts`, `BrandLogo.svelte` and `MediaImage.svelte`. Verify: a search for `/projects/` finds no detail links, and the frontend and Rust checks pass.
5. **QA:** open `/projects` on desktop and mobile, click every card, and try an old `/projects/:slug` link. Verify: every flow works and the browser console has no errors. (DevOps starts the app first.)
6. **Reviewer:** check the diff against the repo rules and run the full fast guard set. Verify: all checks pass and the docs match the workflows.

## Open questions
Only one: is the Personal or Professional table above right? In particular, are IoTnet, Masih Awam LMS and the three capstone or learning projects Personal? If you don't answer, I'll build with the table as written.
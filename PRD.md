# PRD: Abdullah Al Ifaque — Self-Editable Portfolio

## 1. Overview

A personal portfolio website with a dark, monospace, "silent developer" aesthetic (matrix rain background, wireframe globe, cyan/orange accents). Every piece of text and visual content on the public site is editable by the owner through a hidden admin panel, without touching code. Content lives in Supabase; the site is a React + Vite SPA deployed on Vercel.

**Owner is the only user.** There is no multi-user, no public accounts, no comments. This is a content-management layer for one person.

---

## 2. Goals

- Public visitors see a fast, polished, static-feeling portfolio.
- Owner can log in via a secret, unguessable URL and edit **every** text field, image, and list item currently hardcoded in the HTML mockup (hero headline, bio, stats, process steps, skills, tags, project cards, footer links, social URLs).
- No redeploy needed to change content — edits save to Supabase and appear on the live site.
- Simple enough to maintain solo; no CMS platform, no extra services beyond Supabase + Vercel.

## 3. Non-Goals

- No multi-user roles/permissions.
- No public comment system, blog engine, or CMS marketplace features.
- No visual drag-and-drop page builder — admin panel is form-based (structured fields), not freeform layout editing.
- No SSR/ISR (plain SPA, per stack decision).

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite (SPA) | Confirmed preference; fast dev loop, simple deploy |
| Styling | Plain CSS / CSS variables (matches existing mockup) | Already built once, port as-is |
| Backend/DB | Supabase (Postgres + Storage + Auth) | One service for data, auth, and image hosting |
| Auth | Supabase Auth, email/password, single owner account | Reached via secret URL, not linked in public nav |
| Hosting | Vercel | Static SPA deploy, env vars for Supabase keys |
| Routing | React Router | Public routes + hidden `/mgmt-<random-slug>` admin route |

---

## 5. Information Architecture — Editable Content Model

Every section from the mockup becomes a row (or set of rows) in Supabase tables, not hardcoded JSX. Proposed schema:

### `site_content` (singleton key-value table for one-off fields)
| column | type | example |
|---|---|---|
| `key` | text (PK) | `hero_headline` |
| `value` | text | `LET'S BUILD SOMETHING GREAT. MOVE IN SILENCE.` |
| `updated_at` | timestamptz | auto |

Covers: hero headline/subtext, about bio, name, university/degree/year stats, calm-presence statement, qualities heading, footer wordmark, copyright text, social links (LinkedIn/GitHub URLs).

### `triplet_items` (the 3 "No Shortcuts / Block the Noise / One Skill" cards)
| column | type |
|---|---|
| `id` | uuid |
| `order` | int |
| `title` | text |
| `body` | text |

### `process_steps` (Research → Design → Develop → Deliver)
| column | type |
|---|---|
| `id` | uuid |
| `order` | int |
| `step_number` | text (e.g. "01") |
| `title` | text |
| `body` | text |

### `skills` (skill category rows — Web Development, etc.)
| column | type |
|---|---|
| `id` | uuid |
| `order` | int |
| `category` | text |
| `description` | text |
| `tags` | text[] (e.g. `["REACT & TYPESCRIPT", "UI/UX DESIGN"]`) |
| `icon_svg` | text (raw SVG or icon key) |

### `projects` (currently missing from mockup — new section)
| column | type |
|---|---|
| `id` | uuid |
| `order` | int |
| `title` | text |
| `description` | text |
| `image_url` | text (Supabase Storage) |
| `tags` | text[] |
| `live_url` | text |
| `repo_url` | text |

### `education` (currently missing — new section)
| column | type |
|---|---|
| `id` | uuid |
| `order` | int |
| `institution` | text |
| `degree` | text |
| `start_year` | text |
| `end_year` | text |
| `description` | text |

**Images** (hero panel visual, project screenshots) go to a Supabase Storage bucket (`portfolio-assets`, public read), referenced by URL in the tables above.

---

## 6. Admin Panel (Secret Login)

- **Access:** A route like `/mgmt-a7f3k9` (random, not linked anywhere in the public site, not in sitemap/robots). Visiting it shows a Supabase Auth login form — email + password, single account created manually by you in Supabase dashboard.
- **After login:** Dashboard with sections matching the schema above — Hero, About, Triplet Cards, Process Steps, Skills, Projects, Education, Footer/Social Links. Each section is a form (text inputs, textareas, image upload for project/hero images, drag-reorderable lists for repeatable items like projects/skills).
- **Save behavior:** Each save writes directly to Supabase and shows a success toast. No draft/publish split for v1 — saves go live immediately (simplest mental model for a single-owner site).
- **Session:** Supabase Auth session persists via localStorage; auto-logout not required for v1 given single-owner low-risk context, but a manual "Log out" button is included.

---

## 7. Public Site Behavior

- On load, the SPA fetches all content tables from Supabase (a handful of small queries, or one combined query via a Postgres view/RPC for efficiency).
- **Caching approach** (SPA constraint — no server-side revalidation available): content is cached client-side in `sessionStorage` with a short TTL (e.g. 5 minutes). Repeat visits within that window load instantly from cache; after it expires, a fresh fetch happens silently in the background. A hard refresh always gets current data. This gives near-instant perceived load without needing a backend.
- Loading state: skeleton/blank matches background color (no flash of unstyled content) while first fetch resolves.
- If Supabase is unreachable, the site should fail gracefully — show last-cached content if available, otherwise a minimal static fallback (not a broken page).

---

## 8. Security Notes

- Supabase Row Level Security (RLS): public (`anon`) role gets **read-only** access to all content tables. Only the authenticated owner role can `INSERT/UPDATE/DELETE`.
- Storage bucket: public read for images, authenticated-only write.
- The admin URL being "secret" is obscurity, not security — RLS is the actual enforcement layer, so even if someone finds the URL, they can't write without valid Supabase Auth credentials.
- Supabase anon key is safe to expose client-side (standard practice); service role key is never used in the frontend.

---

## 9. Milestones

1. **Schema & Supabase setup** — create tables, RLS policies, storage bucket, owner auth user.
2. **Port existing mockup to React components** — convert the static HTML/CSS into componentized JSX, still hardcoded, to confirm visual parity first.
3. **Wire public site to Supabase** — replace hardcoded content with live fetches + caching layer.
4. **Build admin panel** — auth-gated route, forms for every content table, image upload flow.
5. **Fill in missing sections** — Projects and Education content (currently absent from the design mockup) via the new admin forms.
6. **Deploy** — Vercel project, env vars for Supabase URL/anon key, connect custom domain if applicable.
7. **QA pass** — test edit → save → public reflect cycle for every field; test RLS by attempting anon writes (should fail); mobile responsive check.

---

## 10. Open Questions

- Do you want a **draft vs. published** toggle later (v2), or is instant-live saving always fine?
- Should the admin panel let you reorder sections themselves (e.g. move Projects above Skills), or just reorder items *within* a section?
- Any real project content/screenshots ready to seed the Projects table, or should the DB just launch empty and you fill it in via the admin panel yourself?

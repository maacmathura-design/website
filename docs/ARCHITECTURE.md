# MAAC Mathura website — architecture

The running site is `frontend/` (Create React App, React 18, React Router 6) plus `backend/`
(Express enquiry API that sends Gmail notifications). `maac/` is an older, unused app and is not part of the build.

## Target structure

```
frontend/src/
├── App.js                    route table (paths from routes.js)
├── index.js                  fonts, BrowserRouter, AppProviders, global CSS
├── AppProviders.jsx          ThemeProvider + MotionProvider (also used by tests)
├── routes.js                 every public path, in one place
├── config/api.js             enquiry API URL from REACT_APP_API_URL
├── data/
│   ├── courses.js            all course content (single source of truth)
│   └── site.js               phone, WhatsApp, social links
├── theme/ThemeProvider.jsx   light/dark state, system default, persisted choice
├── motion/                   MotionProvider (LazyMotion + reduced motion), shared presets
├── hooks/                    shared behaviour (useAutoScroll)
├── utils/cx.js               class name joiner
├── styles/
│   ├── tokens.css            colour, type, spacing, motion tokens for both themes
│   ├── breakpoints.js        breakpoint values for JavaScript
│   └── *.css                 legacy page styles, removed as each page is rebuilt
├── components/
│   ├── layout/               Header, Footer, FloatingEnquiryButton, SkipLink
│   ├── ui/                   PrimaryButton, SecondaryButton, Container, SectionHeading, GlassCard,
│   │                         Badge, ThemeToggle, AnimatedSection, Modal (index.js re-exports all)
│   ├── home/                 Hero, CourseHighlights, About, Placements, HowItWorks
│   ├── course/               CourseCatalog, CourseCard, CourseDetail, SoftwareGrid
│   ├── enquiry/              EnquiryCTA, EnquiryForm, EnquiryModal
│   ├── showcase/             StudentShowcase
│   └── faq/                  FaqAccordion
└── pages/                    one thin file per route, composing the components above
                              (DesignSystemPage is the development-only preview)
```

Folders under `components/` are created when their first component is built.

## Styling approach

- New components use CSS Modules (`Component.module.css`), which CRA supports without extra
  dependencies. Class names are scoped per file, so no selector can leak across pages.
- Colours, type sizes, spacing, radii, shadows and durations come from `styles/tokens.css`.
  Components never hard-code brand colours.
- Theme switching sets `data-theme` on `<html>`; tokens change underneath components.
- Reduced motion: tokens set durations to 0 under `prefers-reduced-motion`, and
  `MotionConfig reducedMotion="user"` turns Framer Motion transforms into instant changes.
- Legacy `styles/*.css` files keep their layout until the page that uses them is rebuilt, then the
  file is deleted in the same change. Their colours and fonts already use tokens (Phase 2).

## Design system (Phase 2)

**Themes.** `tokens.css` defines a light and a dark block. Theme selectors are not restricted to
`:root`, so any element with `data-theme` renders its subtree in that theme (the design-system
preview uses this to show both side by side). The first visit follows `prefers-color-scheme`;
the toggle stores the choice under `localStorage['maac-theme']`. An inline script in
`public/index.html` applies the theme before React loads, so there is no flash of the wrong theme,
and `ThemeProvider` keeps `<meta name="theme-color">` in sync.

| Token | Dark | Light |
|---|---|---|
| `--color-bg` | #101114 | #F7F7F5 |
| `--color-bg-secondary` | #181A20 | #FFFFFF |
| `--color-surface` | #202329 | #FFFFFF |
| `--color-accent` | #F4C900 | #E6B800 |
| `--color-text` | #FFFFFF | #171717 |
| `--color-text-muted` | #B7BAC3 | #626262 |

Supporting tokens: `--color-accent-text` (gold that passes AA as text; #7F6400 in light, where
#E6B800 on white is only 1.9:1), `--color-on-accent` (text on gold fills), surface variants,
borders, focus, danger, success, input background, glass, shadows and gradients. Theme-independent
tokens cover text over photos and video (`--color-on-media`, `--overlay-media*`), logo tiles and
the MAAC brand red.

**Typography.** Space Grotesk (headings, `--font-display`) and Inter (body, `--font-body`),
self-hosted through `@fontsource-variable/*`; no third-party font requests.

**Breakpoints.** Mobile first: tablet ≥ 768px, desktop ≥ 1024px, large desktop ≥ 1440px
(`styles/breakpoints.js` for JavaScript).

**Components.** `PrimaryButton`/`SecondaryButton` render a router link (`to`), anchor (`href`) or
button. `GlassCard` uses `backdrop-filter` with a solid fallback where unsupported. `CourseCard`
accepts any record from `data/courses.js` without reshaping it. `EnquiryCTA` uses only the real
phone number and the contact route; pass `onEnquire` to open a modal instead. `Modal` traps focus,
closes on Escape and backdrop click, and restores focus.

**Motion.** `LazyMotion` loads the DOM animation features in a separate chunk after first paint
(about 20 kB gzipped), and `strict` keeps the full `motion` component out of the bundle. Shared
presets live in `motion/presets.js`.

**Preview.** `/design-system` renders every component in both themes. It is registered only when
`NODE_ENV !== 'production'`, and the production build contains no trace of it.

**Enforcement.** `src/styles/designSystem.test.js` fails if any stylesheet other than
`tokens.css` contains a colour literal or a legacy font, checks the requested palette, checks
WCAG AA contrast (4.5:1) for text pairs in both themes, and checks that the pre-paint script
matches the provider. Component behaviour in both themes is covered by
`components/ui/designSystemComponents.test.jsx`.

## Legacy CSS findings

Every legacy stylesheet is imported eagerly by `App.js`, so all selectors apply on all routes.

| Problem | Where | Effect |
|---|---|---|
| Unscoped `h1` rule (3.1em, "Atami") | `AnimationDesignPage.css` | Restyled every `h1` on every page. **Fixed in Phase 2**: scoped to `.animation-page` |
| Unscoped `.content` with `margin-top: -20%` | `AnimationDesignPage.css` | Pulled the Contact heading under the navbar. **Fixed in Phase 2**: scoped to `.animation-page` |
| Unscoped `.container` | `AnimationPage.css` | Generic name; any future `.container` inherits flex + padding |
| `.col-12`, `.col-sm-6`, `.elective-img-bx`, `.student-work-item` in media queries | `VFXPage.css`, `AnimationDesignPage.css` | VFX breakpoints resize the 3D Animation page's elements |
| `.title`, `.info`, `.paragraph`, `.course-card`, `.courses-container` defined twice | `ShortTermSpecializedPage.css`, `MoreCareerCoursesPage.css` | Identical except the hero class; last import wins |
| `GamingPage.css` vs `WebGraphicPage.css` | both | Same selectors (`game-*`), different values; the later import overrides the earlier page |
| Mobile rules target `.main-container` | short-term and more-career CSS | Class does not exist; hero height and `-250px` title offset never adjust on mobile |
| Negative-margin layout | course CSS (`margin-left: -30%`, `margin-top: -20%`, `-8%`), catalog `.title { margin-top: -250px }` | Text overlaps or clips at narrow widths |
| Fonts never loaded | `Conflate`, `Atami`, `Etna` | Silent fallback to system fonts. **Fixed in Phase 2**: replaced by the font tokens |
| Typo selector `game-student-works-container::-webkit-scrollbar` (missing `.`) | `GamingPage.css`, `WebGraphicPage.css` | Rule never matches |
| `.software-item img { size: 10px }` | catalog CSS | Not a CSS property; ignored |
| Brand yellow defined four ways | `#ffcc00`, `#ffd505`, `#fde96d`, `rgb(237,174,21)` | Inconsistent accent. **Fixed in Phase 2**: all use accent tokens |

## Component migration plan

| Current file | Becomes | Phase |
|---|---|---|
| `Navbar.jsx` + `Navbar.css` | `layout/Header` + `layout/CoursesMenu` + `layout/MobileMenu` (**done, Phase 3**) | Layout |
| `Footer.jsx` + `Footer.css` | `layout/Footer` (**done, Phase 3**) | Layout |
| `SideNav.jsx` | `layout/FloatingContact` (**done, Phase 3**) | Layout |
| `EnquiryForm.jsx` | `enquiry/EnquiryForm`, used inline and in the modal (**done, Phase 3**) | Enquiry |
| — | `enquiry/EnquiryProvider` (modal + `useEnquiry().openEnquiry(course)`) (**done, Phase 3**) | Enquiry |
| `HomepageContent.jsx`, `ImageSlider.jsx` | `pages/HomePage` composed from `home/*` sections (**done, Phase 3**) | Homepage |
| `AnimationDesignPage`, `VFXPage`, `GamingPage`, `WebGraphicPage` | one `pages/CourseDetailPage` template driven by `advancedPrograms` (**done, Phase 4**) | Course pages |
| FAQ markup in those pages | `faq/FaqAccordion` (buttons, `aria-expanded`) (**done, Phase 4**) | Course pages |
| Student-work strips + `useAutoScroll` | `showcase/ArtworkGallery` (grid + lightbox) (**done, Phase 4**) | Course pages |
| `course/CourseCatalog.jsx`, `course/CourseCard` | `course/CourseCatalogCard` (**done, Phase 4**) | Course pages |
| `CoursePage.js`, `AnimationPage.js` | `pages/CoursesPage` listing all categories from data (**done, Phase 4**) | Course pages |
| `ShortTermSpecializedPage.js`, `MoreCareerCoursesPage.js` | `pages/CourseCategoryPage` (**done, Phase 4**) | Course pages |
| `PlacementPage.jsx` | `pages/PlacementsPage` (**done, Phase 6**) | Placements |
| `Contact.jsx` | `pages/ContactPage` (**done, Phase 6**) | Contact |

## Homepage (Phase 3)

`pages/HomePage` renders, in order: `Hero`, `AboutSection`, `FeaturedCourses`, `WhyMaac`,
`StudentShowcase`, `SoftwareSection`, `HowItWorks`, `PlacementsSection`, `FaqSection`,
`EnquirySection` (all in `components/home/`). Copy lives in `data/home.js`; recruiter logos in
`data/placements.js`; student work in `data/showcase.js`; FAQs and software are derived from
`data/courses.js` (`programFaqs`, `softwareWithLogos`).

- **Layout.** `App` renders `ScrollManager` (scroll to top on navigation, smooth scroll to `#hash`
  targets once rendered), `Header`, `<main id="main">`, `FloatingContact` and `Footer`. Section
  anchors (`/#about`, `/#courses`, `/#showcase`, `/#placements`, `/#faq`, `/#enquire`) work from any
  page. `[id]` elements get `scroll-margin-top` for the sticky header.
- **Header.** Sticky. Desktop (≥1024px): logo, Home, About (`/About`), Courses mega menu, Student Showcase
  (`/StudentShowcase`), Placements, Contact, Call Now, theme toggle, Enquire Now. Below 1024px: logo, theme toggle,
  Enquire Now and a menu button opening a focus-trapped drawer (nav, course list, Enquire, Call,
  WhatsApp). On the homepage the header is transparent over the hero and switches its subtree to
  `data-theme="dark"`, so it stays legible over imagery in both themes.
- **Mega menu.** Disclosure button with `aria-expanded`; opens on click, or hover on fine pointers;
  closes on Escape (focus returns to the button), outside click, focus leaving, or navigation.
- **Hero.** Real `h1` and HTML copy over the four existing banners (crossfade + slow zoom),
  gradient overlays, slide buttons and a pause control (WCAG 2.2.2). No autoplay or zoom under
  reduced motion. Banners were recompressed into `images/hero/` (desktop 464 kB total, was
  941 kB; 960px variants 118 kB) and served with `srcset`; `object-position` keeps the artwork
  rather than the baked-in lettering in frame on narrow screens.
- **Enquiries.** `EnquiryProvider` (in `AppProviders`) owns one modal, and every "Enquire Now"
  calls `openEnquiry(courseValue?)`. Phase 5 replaced the form and backend; see "Admission
  enquiry system (Phase 5)".
- **Motion.** Reveal-on-scroll via `AnimatedSection`; course videos play only while in view and
  never under reduced motion; the recruiter marquee has a pause button and becomes a static,
  wrapped grid under reduced motion.
- **Build.** `npm run build` sets `IMAGE_INLINE_SIZE_LIMIT=2048` so logos and thumbnails are
  emitted as files instead of base64 inside the JS bundle (main bundle 264 kB → 118 kB gzipped).
  The inline variable syntax works on macOS/Linux hosts; Windows `cmd` would need `cross-env`.
- **Removed** (replaced by the above): `HomepageContent.jsx`, `ImageSlider.jsx`, `Navbar.jsx`,
  `Footer.jsx`, `SideNav.jsx`, the old `EnquiryForm.jsx` and their stylesheets; `parallax-js`;
  `images/image1–4` (superseded by `images/hero/`), `background.jpg`, `backgroundtext.png` and
  `log-in-girl.svg` (only used by removed files), plus `phone.png`, `whatsapp.png`, `fb.jpeg`
  and `instagram.avif`, which nothing imported.

## Course catalogue and detail pages (Phase 4)

**Data.** `data/courses.js` is the single source for all course content. It holds 14 unique
courses: 4 advanced programmes, plus 10 catalogue courses spread across the two other categories.
Three of those courses (Digital Filmmaking, Compositing Plus and Blender) appear in both
categories, and so do the two MAX PRO cards, so each category lists 7 courses, as on the original
pages. Every record has an `id`, `title`, `categories`, `duration`, `skillLevel`, `description`
(array of the original paragraphs), `software` (`{ name, icon | null }`, original names and order),
a `path` and `enquiry { value, label }`. Optional fields are present only where the source had
content:

| Field | Courses |
|---|---|
| `faqs` | the four advanced programmes |
| `learning` (intro, topics, skills) | advanced programmes; topics and skills are verbatim phrases from the descriptions |
| `electives` | AD3D only |
| `studentWork` | ADIDGP only (the only gallery that still exists) |
| `tagline` | ADVFX only |
| `sourceVariants` | AD3D and ADVFX (27 months on `/CoursePage`) |

`courseCategories` defines the three categories (Advanced Programmes, Short-term Courses, More
Career Courses) with their original intro, duration and skill level. `courseHref()` returns the
detail route for advanced programmes and `category path#course-id` for the others.
`courseDataConflicts` lists every source inconsistency (see Content awaiting confirmation); it is
not rendered.

**Pages.**

- `/CoursePage` renders `pages/CoursesPage`: a hero, a sticky category bar, one section per category
  and an enquiry section. `?category=advanced|short-term|more-career` filters to one category; the
  category bar links there for Advanced and to the category pages for the others.
- `/3DAnimation`, `/VFX`, `/Gaming` and `/WebGraphicPage` render one template,
  `pages/CourseDetailPage`. Its sections are: hero, an "On this page" bar, overview with an "At a
  glance" card, what you learn, software, electives, student work, careers, FAQs and enquiry.
  Sections without source content are omitted rather than filled.
- `/ShortTermSpecializedPage` and `/MoreCareerCoursesPage` render `pages/CourseCategoryPage`, with
  all seven original cards per page shown in full. Each card has an `id`, so
  `/ShortTermSpecializedPage#maya-pro` scrolls to it (below the sticky bars) and highlights it.
- Every "Enquire Now" opens the modal with the matching course preselected. Every inline form on
  a course page is also preselected: on a detail page with the programme, on a category page with
  the category.

**Components.** `course/PageHero`, `course/CategoryNav`, `course/CourseCatalogCard`,
`course/CourseVisual` (banner image, or a poster of the course's software logos), `course/Software`
(`SoftwareChips`, `SoftwareGrid`; unknown logos get a monogram), `showcase/ArtworkGallery` (grid
plus keyboard-accessible lightbox, shared with the homepage).

**Enquiry values.** The four original values (`animation`, `vfx`, `gaming`, `web_design`) are
unchanged. Each catalogue course now has its own option, whose value is its course id (for
example `maya-pro`). `short_term` and `more_career` remain under "Not sure yet". The backend
still accepts any `course` string and emails it as-is; an allowlist is part of the backend phase.

**Images.** Detail and category banners are the existing MAAC banners, cropped to drop the
baked-in lettering and stored in `images/courses/` (1920px and 960px JPEGs, served with `srcset`;
82–169 kB and 19–45 kB). The three elective images were downloaded to `images/electives/`. The
old pages hot-linked all of these from maacdelhi.com.

**Removed** (replaced by the above): `AnimationDesignPage.js`, `VFXPage.js`, `GamingPage.js`,
`WebGraphicPage.js`, `CoursePage.js`, `ShortTermSpecializedPage.js`, `MoreCareerCoursesPage.js`,
`AnimationPage.js` (its "View Full Detail" buttons had no handler), `course/CourseCatalog.jsx`,
`course/CourseCard.*`, `hooks/useAutoScroll.js`, their eight stylesheets, and
`images/short-term-main-img.png` and `icons/career-cour-main-img.png` (cropped copies are in
`images/courses/`). These remote assets are no longer used: the six course overview videos on the
detail pages and the 3D cartoon illustrations on `/CoursePage`. They add no course information
and cost several MB per visit; they can be restored as local files if MAAC wants them.

## Secondary pages (Phase 6)

`/About`, `/StudentShowcase`, `/Placement` and `/Contact` use the same hero, section, enquiry
and page-navigation components as the course pages. Header and footer link to the new About and
Student Showcase routes. The homepage sections stay, and now link to those pages. Every route,
including the course pages, sets `document.title` and the description meta tag through
`hooks/usePageMeta`. Phase 7 extends that hook with canonical URLs, social metadata and structured data.

- **About** (`pages/AboutPage`). Sections, in order: hero, About MAAC, About MAAC Mathura (links
  to the four advanced programmes named in the existing Mathura paragraph), training environment
  (the existing infrastructure sentence plus the six homepage steps), faculty and facilities,
  Why choose MAAC (the homepage pillars) and the enquiry form. Copy comes from `data/home.js`.
  No faculty names, address or statistics were added.
- **Student showcase** (`pages/ShowcasePage`). The 14 ADIDGP images in `data/showcase.js`, in the
  existing justified gallery with lightbox. The page says these are MAAC network game-design
  pieces and not work by students of MAAC Mathura. The homepage showcase uses the same note.
- **Placements** (`pages/PlacementsPage`). Placement assistance, then the employer logos whose
  names were read off the artwork, then the workplaces and roles named in the original placements
  paragraph, then the four skill-body marks that used to sit in that logo grid (NCVET, Skill
  India, NSDC, Media & Entertainment Skills Council). Those four are not labeled as employers.
  Cropped duplicates of Technicolor, DNEG, MPC, Accenture, Amazon and BYJU'S are not shown.
  The letters "rrd" are labeled RRD and not expanded. There are no placement counts. The old
  `PlacementPage.jsx` and `PlacementPage.css` were removed.
- **Contact** (`pages/ContactPage`). Phone, WhatsApp, Instagram and Facebook, plus the enquiry
  form. `data/contact.js` keeps `email`, `address`, `hours` and `mapEmbedUrl` as `null`. The page
  renders a field only when it has a value, so no placeholder address, hours, email or map is
  published.

## Search, performance and accessibility (Phase 7)

`hooks/usePageMeta` sets a unique title and description for every route (`data/seo.js`), a canonical
URL for that path without the query string, Open Graph and Twitter card tags, and JSON-LD.
The organization entry is an `EducationalOrganization` named MAAC Mathura, with the published phone
number, Mathura as the area served, Aptech Ltd. as the parent organization, and the Instagram and
Facebook profiles. It does not include an address, email, opening hours or geo coordinates, because
the site does not publish those. Course pages add a `Course` entry from the published title and
description, with no price or duration. Catalogue and category pages add an `ItemList` of the real
links. Breadcrumbs are included only when a page has more than one. The share image is
`public/og.png`, generated from the MAAC logo, not a course banner.

`scripts/write-sitemap.js` runs before `npm run build`. It reads the paths from `src/routes.js`.
When `REACT_APP_SITE_URL` is the public https origin, it writes `sitemap.xml` and a Sitemap line in
`robots.txt`. When that variable is unset, it writes `robots.txt` with `Allow: /` and no sitemap, so
a local origin is never published.

Hero and course banners are served as AVIF or WebP when that file is smaller than the JPEG, with
the JPEG kept as the fallback (`components/media/ResponsiveImage`). Below-the-fold course card
images use `loading="lazy"`. The six homepage course videos set their source only once the card is
near the viewport. The hero slideshow no longer runs a continuous zoom, and it stays still when
reduced motion is requested. The employer marquee pauses when it is off screen. Routes other than
the homepage are loaded with `React.lazy`. The loading state is a full viewport tall, so the footer
does not jump up into view while a route chunk arrives. Only the Latin variable fonts are loaded.

## Admission enquiry system (Phase 5)

- Inline form (`home/EnquirySection`, section `#enquire`) on the homepage, every course and
  category page, the catalogue, About, Student Showcase, Placements and Contact.
- `layout/FloatingContact` on every page: WhatsApp, Call and "Enquire Now". Desktop shows them
  floating bottom-right; below 768px they form a fixed bottom bar (`--mobile-cta-height`, with
  matching `body` padding). The floating "Enquire Now" steps aside while the page's own form is on
  screen.
- The pop-up is the shared `ui/Modal` (animated; a bottom sheet on small screens). Every entry
  point preselects the course: course cards and hero buttons pass their value, and the floating
  button uses `enquiryCourseForPage(pathname, hash)` (detail page → programme, category page →
  `#course` or category).

**Form (`enquiry/EnquiryForm`).**

- Required: student name, mobile, email, course. Optional: qualification, preferred callback
  time, message (1000 characters, live count). Option lists are in `data/enquiry.js` and must
  match `backend/src/enquiryOptions.json`; `data/enquiry.test.js` fails if they drift.
- Client validation mirrors the server (Indian mobile, email, name characters, allowed values),
  showing inline errors with focus on the first one.
- While sending, a ref guard blocks repeat submits, the fieldset is disabled, the button reads
  "Sending…" and the form is `aria-busy`. The request times out after 20s.
- On success the fields reset and a focused `role="status"` message appears (no `alert()`).
  Failures keep the data and show a specific `role="alert"` message with Call and WhatsApp links:
  server field errors appear next to their fields, and there are separate messages for rate
  limiting, network failure, timeout and email unavailable.
- Each submission also sends `sourcePage` (path, query and hash), `formLocation` (`page` or
  `popup`), the honeypot `website` and `elapsedMs` (time since the form appeared).

**Backend (`backend/`).**

```
server.js                    loads backend/.env, checks config, starts the app, verifies Gmail
src/config.js                environment -> config (no secrets logged)
src/app.js                   security headers, HTTPS, CORS, JSON body (10 kB), routes, errors
src/routes/enquiries.js      POST /api/enquiries (+ legacy POST /send-email)
src/routes/health.js         GET /api/health (also /health)
src/validation/enquiry.js    validation, normalisation, spam detection
src/services/mailer.js       Gmail SMTP via Nodemailer; error classification
src/services/enquiryEmail.js subject, text and HTML (all user values HTML-escaped)
src/services/duplicateGuard.js  in-memory repeat-submission guard
src/enquiryOptions.json      allowed courses, qualifications, callback times
test/                        node:test suites with a fake SMTP server
scripts/send-test-enquiry.js real end-to-end email check (npm run smoke:email)
```

The enquiry route runs these checks in order:

1. **Rate limit:** 5 requests per IP per 15 minutes, returning 429 with `retryAfterSeconds`.
2. **JSON only:** any other content type gets 415.
3. **Spam checks:**
   - A filled honeypot, a link in the name, more than two links in the message, or a missing
     `elapsedMs` are answered with a fake 200 and nothing is emailed.
   - A form completed in under 2 seconds gets a 400 asking the person to resubmit. Browser
     autofill can make a real person that fast, so these are not dropped silently.
4. **Validation:** returns 422 with per-field messages; unknown fields are dropped.
5. **Duplicate check:** the same mobile, email and course within 10 minutes returns 200
   `duplicate: true` without a second email. A failed send releases the claim so the student can
   retry.
6. **Send** through `smtp.gmail.com:465`.

Email failures are reported without details:

- Gmail authentication failure (EAUTH, 534/535) or missing configuration: 503
  `email_unavailable`.
- Any other delivery failure: 502 `email_failed`.

Only the error code is logged. Logs are JSON lines containing event names, course ids and error
codes; student details and credentials are never logged.

The notification email:

- Has the subject "New admission enquiry: {course} – {name}".
- Sets `Reply-To` to the student.
- Contains a table of all fields, with "Not provided" for empty optional fields, the source page,
  the form location and the time in IST.
- Has a plain-text alternative.

`GET /api/health` returns `{ status: ok | degraded, mail, uptimeSeconds }`. The `mail` value is one
of `ready`, `unverified`, `auth_failed`, `unreachable` or `not_configured`. Gmail is verified at
startup and after each send.

**Security.**

- **CORS:** only `ALLOWED_ORIGINS`, defaulting to `http://localhost:3000` in development.
  Requests without an `Origin` header (same-origin, curl) are allowed; others get 403.
- **HTTPS (production):** plain-HTTP requests are refused with 403, except the health check, and
  HSTS is sent. `TRUST_PROXY` (default 1) lets `X-Forwarded-Proto` from the TLS-terminating proxy
  count as HTTPS.
- **Headers:** `nosniff`, `DENY` framing, `no-referrer`, `Cache-Control: no-store` and a
  restrictive Content Security Policy. `x-powered-by` is turned off.
- **Production startup:** the server exits if any mail variable or `ALLOWED_ORIGINS` is missing.
- **Frontend build:** `npm run build` first runs `scripts/check-production-env.js`, which refuses an
  `http://` or localhost `REACT_APP_API_URL`, and builds without public source maps.

**Configuration.**

| | Local | Production |
|---|---|---|
| Frontend API URL | unset: `src/setupProxy.js` forwards `/api` to `localhost:5050` (`API_PROXY_TARGET` to change) | unset, with the web server routing `/api/*` to the API (recommended); or an `https://` `REACT_APP_API_URL` |
| Backend | `backend/.env` from `.env.example`, `NODE_ENV=development` | host secrets: `NODE_ENV=production`, mail variables, `ALLOWED_ORIGINS`, `TRUST_PROXY` |
| TLS | none | terminated by the host or proxy; the API refuses plain HTTP |

**Tests.**

- Backend (`npm test`, 35 tests): valid submission, invalid mobile and email, missing fields,
  disallowed values, honeypot, link and timing spam, repeated and simultaneous submissions, rate
  limiting, Gmail authentication failure and delivery failure through real Nodemailer against a
  fake SMTP server, successful delivery, missing configuration, CORS, HTTPS, bad bodies, headers
  and health.
- Frontend: form behaviour, option parity with the backend, and preselection from every entry
  point.
- The real Gmail delivery check is `npm run smoke:email`, run against a running API.

**Dependencies.**

- Backend: added `express-rate-limit`; removed `body-parser`. Express was upgraded to 4.22,
  Nodemailer to 10.6 (Node 20 or newer required) and cors to 2.8.6. `npm audit` reports no
  vulnerabilities.
- Frontend: `http-proxy-middleware` was declared as a dev dependency for `setupProxy.js`; it was
  already installed through `react-scripts`.

## Route compatibility plan

All existing paths stay valid; `routes.js` is the only place they are written. Phase 4 kept
every course URL, so no redirects were needed.

| Path | Page |
|---|---|
| `/` | Home |
| `/CoursePage` (`?category=…` optional) | Courses overview |
| `/3DAnimation` | AD3D Edge PLUS |
| `/VFX` | ADVFX PLUS |
| `/Gaming` | ADIDGP |
| `/WebGraphicPage` | APDMD |
| `/ShortTermSpecializedPage` (`#course-id` optional) | Short-term catalog |
| `/MoreCareerCoursesPage` (`#course-id` optional) | More career catalog |
| `/Placement` | Placements |
| `/Contact` | Contact / enquiry |
| `/About` | About MAAC Mathura |
| `/StudentShowcase` | Student showcase |

Planned additions, without breaking the above:

- A catch-all `*` route rendering a 404 page with links to courses and contact.
- If lower-case, readable URLs are adopted later (for example `/courses/vfx`), the old paths
  become `<Navigate replace>` redirects and stay in `routes.js`.
- The host must rewrite unknown paths to `index.html` so deep links work after deployment.

## Dependencies

Removed in Phase 1 (no source imported them): `bootstrap`, `jquery`, `owl.carousel`,
`react-owl-carousel`, `react-responsive-carousel`, `react-slick`, `slick-carousel`
(the homepage imported slick CSS but rendered no slick markup).

Kept: `react`, `react-dom`, `react-router-dom`, `react-scripts`, `react-icons`, `web-vitals`,
and the CRA testing libraries. `parallax-js` was removed in Phase 3 with the old enquiry form.

Added in Phase 2: `framer-motion` (required motion library), `@fontsource-variable/inter` and
`@fontsource-variable/space-grotesk` (self-hosted fonts; smaller and more private than Google
Fonts links). Icons come from `react-icons/lu` (Lucide), which was already installed.

Decisions:

| Package | Decision | Reason |
|---|---|---|
| `lucide-react` | Do not add | `react-icons` (already installed) includes the Lucide set as `react-icons/lu` |
| `react-hook-form` | Do not add | Seven-field form; controlled state is enough |
| `zod` | Do not add | Validation rules are small; hand-written validators on both sides, with option lists checked for parity by a test |
| `express-rate-limit` | Added (Phase 5) | Standard, small, avoids a hand-written limiter |
| `body-parser` | Removed (Phase 5) | `express.json()` is built in |
| `helmet` | Do not add | The JSON API needs only a handful of headers, set in `src/app.js` |
| `@testing-library/react` 13 | Upgrade to 14+ when convenient | v13 triggers React 18.3's `ReactDOMTestUtils.act` deprecation warning |

## Security findings

- `backend/.env` was committed to git. It is now untracked and ignored, and `backend/.env.example`
  documents the variable names. The Gmail app password in it remains in git history and must be
  revoked and replaced in the Google account; removing it from history requires a history
  rewrite on the remote.
- `backend/node_modules` (580 files) was committed. It is now untracked and ignored.
- **Credential rotation is still outstanding (checked 19 November 2026).** The `EMAIL_PASS`
  in the local `backend/.env` is identical to a value in git history, and Gmail still accepts it.
  Revoke that app password in the Google account, create a new one, and put it only in
  `backend/.env` and the production secret store.
- The frontend contains no API host. Production calls same-origin `/api/enquiries` unless an
  HTTPS `REACT_APP_API_URL` is set; the build refuses `http://` and localhost values.
- Release builds no longer publish source maps (`GENERATE_SOURCEMAP=false` in `npm run build`).
- Resolved in Phase 5:
  - CORS is limited to `ALLOWED_ORIGINS`.
  - Input is validated on the server, and HTML email content is escaped.
  - Rate limiting, a honeypot, a timing check and link checks are in place.
  - Bodies are capped at 10 kB.
  - Production requires HTTPS and sends HSTS.
  - `dotenv` now loads `backend/.env` regardless of the working directory.

Environment variables (names only):

| Variable | Where | Purpose |
|---|---|---|
| `NODE_ENV` | backend | `production` enables HTTPS enforcement and strict startup checks |
| `PORT` | backend | API port (default 5050) |
| `EMAIL_USER` | backend | Gmail sender account |
| `EMAIL_PASS` | backend | Gmail app password (secret) |
| `RECIPIENT_EMAIL` | backend | Inbox receiving enquiries |
| `ALLOWED_ORIGINS` | backend | Comma-separated site origins allowed to call the API (required in production) |
| `TRUST_PROXY` | backend | Proxy hops in front of the API (production default 1) |
| `REQUIRE_HTTPS` | backend | Override HTTPS enforcement (default: on in production) |
| `ENQUIRY_RATE_LIMIT_MAX`, `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES`, `ENQUIRY_DUPLICATE_WINDOW_MINUTES`, `ENQUIRY_MIN_FILL_SECONDS` | backend | Optional tuning (5, 15, 10, 2) |
| `REACT_APP_API_URL` | frontend | Enquiry API base URL (public, build time; empty = same origin) |
| `API_PROXY_TARGET` | frontend, development only | Where `setupProxy.js` forwards `/api` (default `http://localhost:5050`) |

## Content awaiting confirmation

Course data is copied verbatim. These items are inconsistent in the source and are left unchanged
until MAAC Mathura confirms the correct values:

- AD3D Edge PLUS and ADVFX PLUS: 24 months on their detail pages, 27 months on `/CoursePage`.
- ADIDGP title ends in "Game Design Plu".
- APDMD shows the ADIDGP gaming FAQ, lists Adobe Illustrator twice, and its software list mirrors
  the gaming list.
- "Mazon Zbrush" spelling on the gaming and APDMD lists.
- Second "MAX PRO" card lists only Cinema 4D but uses the 3ds Max description.
- More Career banner says "12 to 20 Months"; four of its seven courses are 6–7 months.
- Every student-work section says "students studying 3D Animation".
- VFX FAQ "What is the scope of Animation?" describes 3D animation, not VFX.
- FAQ typos kept as written: "Tv series, Ott, E-Commerce … Much More", "Can I learn Animation &
  VFX both??" and the answer without a full stop.
- Not present anywhere, and therefore not published: fees, eligibility, batch dates, a centre
  email address, centre address, opening hours, a map, testimonials, placement statistics.
  `data/contact.js` leaves email, address, hours and the map empty so the contact page can show
  them once MAAC Mathura supplies the real values.

Phase 3 copy decisions (homepage):

- All Delhi references were removed, for example "the best trainers in Delhi" became "MAAC
  trainers", and the Delhi course-page blurbs were dropped. The footer's "Mac" text was replaced
  with the existing About copy.
- Claims that could not be verified were left out: "students win many Awards", "top-notch job
  placements", "placements with top companies". The placements section states that placement
  assistance is offered and placement is not guaranteed.
- Phase 3 corrected two FAQ typos; Phase 4 restored the original wording because course text
  must not change without review (listed above).
- Recruiter logos are named from the artwork; the original alt text was "Company logo N". The
  homepage and `/Placement` show the six `images/company*.png` logos, the 14 files in
  `images/recruiters/`, and the RRD mark (`companies/image7.png`, labeled with the letters on it).
  NCVET, Skill India, NSDC and the Media & Entertainment Skills Council (`companies/image.png`
  through `image3.png`) are shown on `/Placement` as skill bodies, not employers. Cropped copies
  of logos already in the set are not shown.
- Student showcase images are the 14 ADIDGP (game design) images still published on
  maacdelhi.com, now stored locally in `images/showcase/`. They come from the MAAC network site,
  so the copy says "MAAC students", not "MAAC Mathura students". Mathura's own student work
  should replace them.
- Hero banners include third-party film artwork (for example *Big Hero 6* characters on the
  3D Animation banner). They are existing MAAC assets, but usage rights should be confirmed.
- No centre address appears in the footer because none exists in the source.

Remote assets that no longer exist (HTTP 404 from maacdelhi.com, checked November 2026): the
navbar logo video `img/maac-logo.mp4` (the navbar now uses the local `images/maac.png`), the 16+
`img/software-img*.png` logos used on the four advanced-program pages, and the 3D Animation,
VFX and digital media student-work galleries (`ad3d`, `advfx`, `apdmd` folders). Only the game
design gallery still loads. Replacement artwork from MAAC Mathura is needed. Course pages use local
logos where one exists and a lettered tile otherwise; the AD3D, ADVFX and APDMD pages have no
student-work section until real artwork is supplied.

Phone links now all use +91 8859833392, the number shown in the header and footer. The side
rail previously dialled a number missing one digit; two unused components that used
+91 7249647735 were deleted.

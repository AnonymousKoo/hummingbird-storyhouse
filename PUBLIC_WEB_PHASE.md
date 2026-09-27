# Phase 4 — Hummingbird Storyhouse Public Media-Tech Site

Build the public-facing Hummingbird Storyhouse website as `apps/web` in the existing monorepo.

This is NOT the internal operator app and must not import the operator UI or private Postgres runtime.
The public site should feel like a premium media company fused with a technology company: cinematic, editorial, kinetic, culturally aware, and system-driven.

## Brand positioning
Hummingbird Storyhouse is a multimedia/content company building stories, campaigns, media systems, and eventually original IP.
Public positioning should communicate three things quickly:
1. Hummingbird understands culture.
2. Hummingbird produces exceptional media.
3. Hummingbird has systems/intelligence behind the creative work.

Avoid presenting the business as a social-media agency, AI-content factory, SaaS dashboard, or generic production studio.

Primary brand idea:
"Stories don't sit still. Neither do we."

Supporting idea:
"Hummingbird Storyhouse builds stories, media systems, and original worlds designed to move through culture."

Core model:
Culture × Storytelling × Media Systems.

## Visual system — completely new public palette
Do NOT reuse the operator app parchment/amber system.

Colors:
- Midnight Ink #080B14 — primary background
- Deep Indigo #11152A — secondary background
- Electric Orchid #A855F7 — primary creative signal
- Signal Coral #FF5C7A — emotional/energy accent
- Digital Aqua #36E4DA — intelligence/data accent
- Cloud #F4F5FA — light surface
- Soft White #F8F7FC — primary text
- Silver Lavender #A9A7BA — secondary text

Use the orchid/coral/aqua combination selectively, primarily as signals, borders, media glow, motion trails, data marks, and interactive states.
No full-page rainbow gradient.
No black/gold luxury aesthetic.
No generic SaaS blue.
No pastel creator-agency aesthetic.

Typography:
- Editorial expressive serif or serif-adjacent display face via next/font (Google is acceptable).
- Clean modern grotesk/sans body.
- Strong contrast: story/editorial voice × systems/technology voice.
- Oversized display headlines and high-impact line breaks.

Art direction:
- Dense cinematic moments paired with large negative space.
- Asymmetrical media frames, vertical-video crops, timelines, signal/data marks, editorial type.
- Avoid stock photography, fake case-study imagery, and generic card grids.
- Site should remain excellent even with zero external image assets.

## Signature interaction — The Story Engine
This is the memorable centerpiece and should appear in or immediately after the hero.

Show one central story/idea transforming into a branching media system:
Business objective / story seed
→ Hero story
→ Reel / Short / Still / Carousel / Audio / Editorial
→ Distribution
→ Signal capture
→ Next creative decision

Implement as a polished animated visual using semantic HTML/CSS/SVG/React only.
It must:
- feel like media moving through a system
- react subtly to scroll/hover
- gracefully reduce motion with prefers-reduced-motion
- remain understandable without animation
- avoid looking like a software architecture diagram

The Hummingbird motion language should imply:
speed, precision, hovering, iridescence, direction changes.
Do not plaster literal hummingbirds around the site.

## Homepage narrative / sections

### 1. Hero — full viewport
Headline:
"Stories don't sit still.
Neither do we."

Support:
"Hummingbird Storyhouse builds stories, media systems, and original worlds designed to move through culture."

Primary CTA: "Start a project"
Secondary CTA: "Enter the Storyhouse"

Hero visual:
A cinematic composition of floating media-format frames and signal lines, all built in UI/CSS rather than fake stock visuals.
Possible frames: vertical video crop, waveform/audio tile, campaign title card, editorial pullquote, audience signal card, release timeline.
The composition should subtly respond to pointer/scroll on capable devices.

Include a compact descriptor such as:
"Multimedia company · Strategy · Production · Distribution · Intelligence"

### 2. Positioning reveal — The Storyhouse
Statement:
"Not a content factory.
A media operating company."

Explain that Hummingbird connects strategy, creative development, production, release, audience intelligence, and learning into one compound media loop.

Show a kinetic sequence:
STRATEGY → CREATE → PRODUCE → RELEASE → LEARN → COMPOUND

### 3. Capabilities — "What moves through the house"
Use an editorial/asymmetrical grid, not six identical cards:
- Brand & Content Strategy
- Creative Development
- Video + Multimedia Production
- Creator Partnerships
- Distribution
- Audience Intelligence
- Originals & IP

Each capability should feel distinct through typography/layout/micro-interaction while staying cohesive.

### 4. Story Engine
Feature the signature interaction in depth.
Narrative:
"One strong story should not become one asset."
Show one core story expanding into many formats and then feeding performance signals back into the next decision.

### 5. Ecosystem / selected worlds
Do not imply these are external paying clients if they are not.
Frame as "Built inside the ecosystem" or similar.
Show:
- TableGrid — Food / Network / Brand storytelling
- VYRAL — Gaming / Community / Entertainment
- Yaadbody — Wellness / Education / Lifestyle
Use editorial project tiles with strong typography and abstract branded visual treatments; no fake screenshots required.
Make this section easy to replace with real case studies later.

### 6. Storyhouse Originals
Give this its own cinematic chapter, like entering a streaming/editorial environment.
Categories:
Films · Series · Podcasts · Digital Formats · Editorial · Experimental
Use "In development" states where appropriate.
Positioning:
"We don't only make media for brands. We build media worth owning."

### 7. Intelligence / Signals
Headline:
"Every release teaches the next one."
Visualize signals:
Hook → Retention → Saves → Shares → Conversion → Audience
Then:
Create → Measure → Learn → Improve
Technology should be visible as intelligence, not marketed as AI software.

### 8. How brands enter the Storyhouse
Five-part relationship:
01 Discover
02 Build
03 Release
04 Learn
05 Compound
Avoid package-tier pricing on the homepage.

### 9. Final CTA
Large closing statement:
"You have something worth saying.
Let's make it impossible to ignore."

CTA: "Bring us the story →"
This can currently link to a polished intake/contact section on the same page.

### 10. Footer
Minimal:
Hummingbird Storyhouse
Work / Capabilities / Originals / Story Engine / Start a Project
Brand sign-off:
"Culture moves. Stories carry it."

## Interaction and motion rules
- 90% elegant / 10% spectacle.
- Smooth native-feeling scrolling; do not hijack scroll.
- Line-by-line text reveals, subtle frame parallax, snap-in signal movement, hover depth.
- Avoid constant bouncing, cursor replacement, giant page transitions, or motion that blocks reading.
- Respect prefers-reduced-motion.
- Mobile should keep the design hierarchy but simplify spatial effects.
- Buttons and links need visible focus states and large touch targets.

## Intake / conversion
The public page must include a real functional front-end intake form section, but DO NOT connect to Hummingbird/Postgres/Avuhz yet.
Fields:
- Name
- Email
- Company / brand
- What are you trying to move? (short textarea)
- Interested in: strategy / campaign / production / distribution / partnership / originals
- Optional budget range
- CTA: "Bring us the story"

For this deployment, submit should route to a local success state/client-side acknowledgement only and clearly label the implementation TODO in code/docs.
Do not fake backend delivery.
No external analytics or tracking yet.

## Technical
- Next.js App Router under apps/web
- Current stable compatible Next.js version with 0 known npm audit vulnerabilities
- React 19
- TypeScript strict
- Use next/font
- Prefer Server Components; client code only for interactions/form/motion
- No database requirement
- No runtime environment variables required for public deployment
- Static/ISR-friendly
- Metadata, OpenGraph metadata, favicon/icon generated in-code if practical
- Semantic HTML and accessibility
- Good SEO copy without keyword stuffing
- excellent Lighthouse-oriented fundamentals
- no external image hotlinks
- no secrets
- no marketing analytics yet

## Monorepo / Vercel readiness
- apps/web must build independently from its own package.json.
- It may not require the private root database dependencies to render.
- Add apps/web/README.md with local commands and Vercel root-directory instructions.
- Update root README/ROADMAP for public site.
- Add any needed ignores for .next, Vercel local metadata, etc.
- The intended Vercel project name is `hummingbird-storyhouse`.
- Vercel root directory should be `apps/web`.
- Production target should require no env vars in this phase.

## Verification
Before completing:
1. Root core check remains green.
2. Public site npm audit = 0 vulnerabilities.
3. apps/web production build succeeds.
4. Run local public dev server.
5. Verify with real Chrome/headless browser at desktop 1440px and mobile ~390px.
6. Check meaningful content, no error overlay, key navigation anchors, CTA/intake form.
7. Check no obvious horizontal overflow on mobile.
8. Run route HTTP smoke checks.
9. git diff --check.
10. Do not commit generated .next or node_modules.

Create and commit this work on branch phase-4-public-web. Do not deploy from the agent; deployment will be handled after review.

# Phase 5 — Marketing + Growth Domain and Public Positioning

Expand Hummingbird Storyhouse so marketing is a first-class part of the business domain, not an Avuhz-owned add-on.

## Core principle
Hummingbird owns:
business objective -> audience -> positioning -> offer -> marketing plan -> campaign -> content -> distribution -> conversion -> learning -> retention/next cycle.

Avuhz may later automate/orchestrate research, execution, integrations, follow-up, scheduling, testing and reporting, but Hummingbird owns the rules, entities, outcomes and measurement model.

Do NOT create a parallel duplicate campaign system. Existing Campaign remains the media/campaign execution aggregate. Add a marketing/growth layer that can coordinate one or more existing campaigns.

## New bounded context: marketing
Create src/domain/marketing.ts with pragmatic types and invariants.

### MarketingPlan aggregate
Fields:
- id MarketingPlanId
- tenantId
- brandId
- strategyId
- name
- businessOutcome (non-empty)
- positioning (non-empty)
- offer: { name, promise, cta }
- audienceSegments: array of { id:string, name:string, description:string, need:string }
- funnelStages: array using stage enum: awareness | consideration | conversion | retention | advocacy
  each { stage, objective, cta, channels: MarketingChannel[] }
- conversionGoals: array { name, eventType, target?: number, value?: Money }
- campaignIds: CampaignId[]
- status: draft | active | archived
- createdAt
- activatedAt optional

MarketingChannel enum should support:
organic_social | paid_social | search | email | creator | partnership | community | web | referral | other

Invariants:
- plan requires businessOutcome, positioning, at least one audience segment, at least one funnel stage, at least one conversion goal
- audience segment ids unique
- funnel stage appears at most once
- conversion goal names unique
- linked campaigns must belong to the same brand/strategy when linked through application service

### MarketingExperiment aggregate
Fields:
- id MarketingExperimentId
- tenantId
- marketingPlanId
- campaignId optional
- name
- hypothesis
- variants: at least 2, each { id, label, description }
- primaryMetric
- status: draft | running | completed | cancelled
- startedAt/completedAt optional
- winnerVariantId optional
- createdAt

Transitions:
draft -> running -> completed
draft/running -> cancelled
winner must be one of variants; completing requires winner.

### ConversionEvent aggregate
Fields:
- id ConversionEventId
- tenantId
- marketingPlanId
- campaignId optional
- contentId optional
- publicationId optional
- eventType: lead | qualified_lead | booking | signup | purchase | renewal | referral | custom
- channel MarketingChannel
- source string
- value optional Money
- occurredAt
- metadata record<string,string>

### MarketingSpend aggregate
Fields:
- id MarketingSpendId
- tenantId
- marketingPlanId
- campaignId optional
- channel MarketingChannel
- amount Money
- occurredAt
- note optional

Add pure calculations:
- summarizeMarketing(plan, conversions, spend) returning:
  totalSpend
  attributedValue
  leads
  qualifiedLeads
  purchases
  conversionCount
  cac (when qualified/purchase denominator exists; pick documented convention)
  roas (attributedValue / spend, null when zero spend)
  channelBreakdown
Do not invent statistical attribution models. Treat conversion events as explicitly attributed records.

## Shared IDs / repositories / persistence
Add opaque IDs:
MarketingPlanId, MarketingExperimentId, ConversionEventId, MarketingSpendId.

Extend StoryhouseRepositories with repositories for all four aggregate types.
Extend in-memory adapters and Postgres transaction repositories.

Add db/migrations/002_marketing_growth.sql:
- storyhouse.marketing_plans
- storyhouse.marketing_experiments
- storyhouse.conversion_events
- storyhouse.marketing_spend
Use same tenant-safe table pattern as existing schema: id, tenant_id, relational reference columns, payload jsonb, timestamps/indexes, unique tenant/id and tenant-scoped foreign keys where practical.
Migration must cooperate with existing migration checksum/drift system.
No auth/RLS assumptions.

## Application commands/services
Add StoryhouseService methods and typed command contracts:
- marketing.create_plan
- marketing.activate_plan
- marketing.link_campaign
- marketing.create_experiment
- marketing.start_experiment
- marketing.complete_experiment
- marketing.record_conversion
- marketing.record_spend

Rules:
- create plan verifies brand and strategy exist and match
- activate plan only from draft
- link campaign verifies campaign exists and matches plan brand + strategy; idempotently avoid duplicate campaign IDs
- experiment campaign, when provided, must already be linked to the plan
- conversion/spend campaign, content, publication refs when provided must be tenant-safe and logically connected where feasible
- all writes emit domain events through existing event bus/outbox
- durable gateway/idempotency must work with all new command types with no special bypass

## Query/read model
Extend operator/read-model service with transport-neutral marketing reads:
- marketing plans list/detail
- experiments for plan
- conversions/spend for plan
- marketing performance summary using summarizeMarketing
No operator UI route is required in this phase; keep it usable by future operator UI/Avuhz/API callers.

## Tests
Add unit tests for:
- MarketingPlan invariants
- activation/link rules
- experiment transitions/winner validation
- marketing summary math including zero-spend behavior and currency mismatch protection

Extend real Postgres integration tests:
- migration 002 applies/repeats
- marketing aggregates round-trip tenant-safe
- durable command path creates/activates plan, links an existing campaign, records spend + conversion, creates/runs/completes experiment
- outbox + receipt atomicity still holds for marketing commands
- another tenant cannot read marketing aggregates

Keep all existing tests green.

## Public website — clear client understanding
Update apps/web while preserving the current premium media-tech art direction and exact palette.

### Positioning
Do not use "full-service marketing agency".
Do not make Avuhz visible.
Do not mention automation as a promise.

Update hero/support/descriptor so it is unmistakable that Hummingbird combines media and marketing:
Suggested direction:
- kicker: Culture × Storytelling × Marketing Systems
- support: Hummingbird Storyhouse builds stories, campaigns, media systems, and growth loops designed to move people and move business.
- descriptor: Media + marketing company · Strategy · Creative · Production · Distribution · Growth Intelligence

### Storyhouse positioning
Change "media operating company" to "media + marketing operating company".
Plain-language explanation:
We connect the business objective, audience, offer, creative, production, distribution, conversion and learning in one loop.

### Capabilities
Keep the editorial asymmetric system but ensure explicit capabilities exist for:
- Brand, Audience & Marketing Strategy
- Creative Development
- Video + Multimedia Production
- Creator Partnerships
- Channel Distribution
- Growth Marketing
- Audience & Performance Intelligence
- Originals & IP
Make Growth Marketing copy concrete: campaign design, funnel/channel planning, conversion paths, lifecycle, experimentation—not vague "growth".

### NEW dedicated section: Media meets marketing
Add a visually strong section after capabilities and before Story Engine.
Headline direction:
"Attention is only the beginning."
Copy:
"Media earns the attention. Marketing gives that attention somewhere to go."
Explain Hummingbird designs story + audience + offer + channel + CTA + measurement together from the start.

Visualize:
AWARENESS -> CONSIDERATION -> CONVERSION -> RETENTION
with channel signals around it:
SOCIAL / SEARCH / EMAIL / CREATOR / PARTNERSHIPS / PAID / WEB
and outcomes:
AUDIENCE / QUALIFIED LEADS / BOOKINGS / SIGNUPS / PURCHASES / RETENTION
This is explanatory design, not fake performance data.

### Story Engine
Evolve the visual/narrative to:
BUSINESS OBJECTIVE -> AUDIENCE + OFFER -> HERO STORY -> NATIVE FORMATS -> DISTRIBUTION -> ACTION/CONVERSION -> SIGNALS -> NEXT CREATIVE/MARKETING DECISION
It should still feel like media, not a SaaS workflow chart.

### Intelligence section
Clarify that Hummingbird evaluates both media and business signals.
Use labels such as:
ATTENTION, RETENTION, INTENT, LEADS, CONVERSION, VALUE
If numeric sample data remains, label the panel clearly "ILLUSTRATIVE SIGNAL MODEL" or replace with non-claiming signal states so it cannot be mistaken for a client case study.

### Working together
Make the process:
01 Discover — business outcome/audience
02 Position — offer/message/channel
03 Build — creative/production
04 Release — distribution/campaign
05 Convert & Learn — results/learning/next cycle
Can be five steps; make copy client-friendly.

### Intake
Add options:
- Brand & marketing strategy
- Growth marketing
- Campaign
- Production
- Distribution
- Creator partnership
- Originals
Change objective placeholder to include growth/business outcome.
Keep local-only acknowledgement honestly labeled.

### Metadata
Update title/description/keywords to reflect media + marketing without SEO stuffing.
Do not reintroduce Black-owned label.

## Design quality
Keep current public palette:
Midnight Ink #080B14
Deep Indigo #11152A
Electric Orchid #A855F7
Signal Coral #FF5C7A
Digital Aqua #36E4DA
Cloud #F4F5FA
Soft White #F8F7FC
Silver Lavender #A9A7BA

Integrate the new section into the same visual language.
Do not turn the page into a funnel infographic template.
Preserve responsive motion/reduced-motion/accessibility.
Renumber section indicators coherently if visible.

## Docs
Update README, ARCHITECTURE, DOMAIN_MODEL, ROADMAP, AGENTS and apps/web README as relevant.
State marketing is Hummingbird-owned domain; Avuhz is a future orchestration/integration layer.

## Verification / deployment readiness
Work on branch phase-5-marketing-growth.
Before finishing:
- npm run check:all
- npm run operator:check
- apps/web typecheck + production build
- root and apps/web npm audits = 0 if achievable
- git diff --check
- local real Postgres migration/integration suite passes
- real browser desktop/mobile smoke for public site, zero horizontal overflow, no console/runtime errors
- verify client can clearly find "marketing"/"growth" language in rendered content
- no generated .next/node_modules staged
- commit branch, but do not deploy; deployment/merge will be handled after review

CREATE TABLE storyhouse.brands (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id)
);
CREATE INDEX brands_tenant_idx ON storyhouse.brands (tenant_id);

CREATE TABLE storyhouse.strategies (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  brand_id text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, brand_id) REFERENCES storyhouse.brands (tenant_id, id)
);
CREATE INDEX strategies_tenant_idx ON storyhouse.strategies (tenant_id);
CREATE INDEX strategies_brand_idx ON storyhouse.strategies (tenant_id, brand_id);

CREATE TABLE storyhouse.campaigns (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  brand_id text NOT NULL,
  strategy_id text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, brand_id) REFERENCES storyhouse.brands (tenant_id, id),
  FOREIGN KEY (tenant_id, strategy_id) REFERENCES storyhouse.strategies (tenant_id, id)
);
CREATE INDEX campaigns_tenant_idx ON storyhouse.campaigns (tenant_id);
CREATE INDEX campaigns_strategy_idx ON storyhouse.campaigns (tenant_id, strategy_id);

CREATE TABLE storyhouse.content_items (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  campaign_id text NOT NULL,
  parent_id text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, campaign_id) REFERENCES storyhouse.campaigns (tenant_id, id),
  FOREIGN KEY (tenant_id, parent_id) REFERENCES storyhouse.content_items (tenant_id, id)
);
CREATE INDEX content_items_tenant_idx ON storyhouse.content_items (tenant_id);
CREATE INDEX content_items_campaign_idx ON storyhouse.content_items (tenant_id, campaign_id);

CREATE TABLE storyhouse.approval_requests (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  content_id text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, content_id) REFERENCES storyhouse.content_items (tenant_id, id)
);
CREATE INDEX approval_requests_tenant_idx ON storyhouse.approval_requests (tenant_id);
CREATE INDEX approval_requests_content_idx ON storyhouse.approval_requests (tenant_id, content_id);

CREATE TABLE storyhouse.media_assets (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  content_ids text[] NOT NULL DEFAULT '{}',
  campaign_ids text[] NOT NULL DEFAULT '{}',
  payload jsonb NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);
CREATE INDEX media_assets_tenant_idx ON storyhouse.media_assets (tenant_id);
CREATE INDEX media_assets_content_ids_idx ON storyhouse.media_assets USING gin (content_ids);
CREATE INDEX media_assets_campaign_ids_idx ON storyhouse.media_assets USING gin (campaign_ids);

CREATE TABLE storyhouse.publication_intents (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  content_id text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, content_id) REFERENCES storyhouse.content_items (tenant_id, id)
);
CREATE INDEX publication_intents_tenant_idx ON storyhouse.publication_intents (tenant_id);
CREATE INDEX publication_intents_content_idx ON storyhouse.publication_intents (tenant_id, content_id);

CREATE TABLE storyhouse.performance_observations (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  publication_id text NOT NULL,
  content_id text NOT NULL,
  campaign_id text NOT NULL,
  strategy_id text NOT NULL,
  payload jsonb NOT NULL,
  observed_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, publication_id) REFERENCES storyhouse.publication_intents (tenant_id, id),
  FOREIGN KEY (tenant_id, content_id) REFERENCES storyhouse.content_items (tenant_id, id),
  FOREIGN KEY (tenant_id, campaign_id) REFERENCES storyhouse.campaigns (tenant_id, id),
  FOREIGN KEY (tenant_id, strategy_id) REFERENCES storyhouse.strategies (tenant_id, id)
);
CREATE INDEX performance_observations_tenant_idx ON storyhouse.performance_observations (tenant_id);
CREATE INDEX performance_observations_publication_idx ON storyhouse.performance_observations (tenant_id, publication_id);

CREATE TABLE storyhouse.insights (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  strategy_id text NOT NULL,
  campaign_id text NOT NULL,
  observation_ids text[] NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, strategy_id) REFERENCES storyhouse.strategies (tenant_id, id),
  FOREIGN KEY (tenant_id, campaign_id) REFERENCES storyhouse.campaigns (tenant_id, id)
);
CREATE INDEX insights_tenant_idx ON storyhouse.insights (tenant_id);
CREATE INDEX insights_campaign_idx ON storyhouse.insights (tenant_id, campaign_id);

CREATE TABLE storyhouse.creators (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  campaign_ids text[] NOT NULL DEFAULT '{}',
  payload jsonb NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);
CREATE INDEX creators_tenant_idx ON storyhouse.creators (tenant_id);
CREATE INDEX creators_campaign_ids_idx ON storyhouse.creators USING gin (campaign_ids);

CREATE TABLE storyhouse.engagements (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  campaign_ids text[] NOT NULL,
  payload jsonb NOT NULL,
  starts_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id)
);
CREATE INDEX engagements_tenant_idx ON storyhouse.engagements (tenant_id);
CREATE INDEX engagements_campaign_ids_idx ON storyhouse.engagements USING gin (campaign_ids);

CREATE TABLE storyhouse.invoices (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  engagement_id text NOT NULL,
  payload jsonb NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, engagement_id) REFERENCES storyhouse.engagements (tenant_id, id)
);
CREATE INDEX invoices_tenant_idx ON storyhouse.invoices (tenant_id);
CREATE INDEX invoices_engagement_idx ON storyhouse.invoices (tenant_id, engagement_id);

CREATE TABLE storyhouse.command_receipts (
  tenant_id text NOT NULL,
  command_id text NOT NULL,
  command_type text NOT NULL,
  command_payload jsonb NOT NULL,
  result jsonb NOT NULL,
  completed_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, command_id)
);
CREATE INDEX command_receipts_completed_idx ON storyhouse.command_receipts (tenant_id, completed_at, command_id);

CREATE TABLE storyhouse.outbox_events (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  aggregate_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  dispatched_at timestamptz,
  last_error text,
  UNIQUE (tenant_id, id)
);
CREATE INDEX outbox_events_tenant_idx ON storyhouse.outbox_events (tenant_id);
CREATE INDEX outbox_events_pending_idx ON storyhouse.outbox_events (tenant_id, occurred_at, id) WHERE dispatched_at IS NULL;

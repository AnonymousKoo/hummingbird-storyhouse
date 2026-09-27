CREATE TABLE storyhouse.marketing_plans (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  brand_id text NOT NULL,
  strategy_id text NOT NULL,
  campaign_ids text[] NOT NULL DEFAULT '{}',
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  activated_at timestamptz,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, brand_id) REFERENCES storyhouse.brands (tenant_id, id),
  FOREIGN KEY (tenant_id, strategy_id) REFERENCES storyhouse.strategies (tenant_id, id)
);
CREATE INDEX marketing_plans_tenant_idx ON storyhouse.marketing_plans (tenant_id);
CREATE INDEX marketing_plans_brand_idx ON storyhouse.marketing_plans (tenant_id, brand_id);
CREATE INDEX marketing_plans_strategy_idx ON storyhouse.marketing_plans (tenant_id, strategy_id);
CREATE INDEX marketing_plans_campaign_ids_idx ON storyhouse.marketing_plans USING gin (campaign_ids);

CREATE TABLE storyhouse.marketing_experiments (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  marketing_plan_id text NOT NULL,
  campaign_id text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, marketing_plan_id) REFERENCES storyhouse.marketing_plans (tenant_id, id),
  FOREIGN KEY (tenant_id, campaign_id) REFERENCES storyhouse.campaigns (tenant_id, id)
);
CREATE INDEX marketing_experiments_tenant_idx ON storyhouse.marketing_experiments (tenant_id);
CREATE INDEX marketing_experiments_plan_idx ON storyhouse.marketing_experiments (tenant_id, marketing_plan_id);
CREATE INDEX marketing_experiments_campaign_idx ON storyhouse.marketing_experiments (tenant_id, campaign_id);

CREATE TABLE storyhouse.conversion_events (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  marketing_plan_id text NOT NULL,
  campaign_id text,
  content_id text,
  publication_id text,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, marketing_plan_id) REFERENCES storyhouse.marketing_plans (tenant_id, id),
  FOREIGN KEY (tenant_id, campaign_id) REFERENCES storyhouse.campaigns (tenant_id, id),
  FOREIGN KEY (tenant_id, content_id) REFERENCES storyhouse.content_items (tenant_id, id),
  FOREIGN KEY (tenant_id, publication_id) REFERENCES storyhouse.publication_intents (tenant_id, id)
);
CREATE INDEX conversion_events_tenant_idx ON storyhouse.conversion_events (tenant_id);
CREATE INDEX conversion_events_plan_idx ON storyhouse.conversion_events (tenant_id, marketing_plan_id, occurred_at);
CREATE INDEX conversion_events_campaign_idx ON storyhouse.conversion_events (tenant_id, campaign_id);

CREATE TABLE storyhouse.marketing_spend (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  marketing_plan_id text NOT NULL,
  campaign_id text,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  UNIQUE (tenant_id, id),
  FOREIGN KEY (tenant_id, marketing_plan_id) REFERENCES storyhouse.marketing_plans (tenant_id, id),
  FOREIGN KEY (tenant_id, campaign_id) REFERENCES storyhouse.campaigns (tenant_id, id)
);
CREATE INDEX marketing_spend_tenant_idx ON storyhouse.marketing_spend (tenant_id);
CREATE INDEX marketing_spend_plan_idx ON storyhouse.marketing_spend (tenant_id, marketing_plan_id, occurred_at);
CREATE INDEX marketing_spend_campaign_idx ON storyhouse.marketing_spend (tenant_id, campaign_id);

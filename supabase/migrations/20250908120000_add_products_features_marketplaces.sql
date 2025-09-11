-- Add optional JSONB columns for product features and marketplace links
alter table if exists public.products
  add column if not exists features jsonb null,
  add column if not exists marketplace_links jsonb null;

comment on column public.products.features is 'Array of strings or objects describing product features';
comment on column public.products.marketplace_links is 'Array of {name, url, logo} objects for external marketplaces';



-- Add category column to products table
alter table public.products 
add column if not exists category text not null default 'Elektronik' 
check (category in ('Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor', 'Kozmetik', 'Kitap', 'Oyuncak', 'Diğer'));

-- Update the public view to include category
create or replace view public.v_products_public as
with cover as (
  select distinct on (pi.product_id)
    pi.product_id, pi.url as cover_url
  from public.product_images pi
  order by pi.product_id, pi.position asc, pi.created_at nulls last
),
images as (
  select product_id, json_agg(json_build_object('url', url, 'position', position) order by position asc) as images
  from public.product_images
  group by product_id
),
markets as (
  select product_id, json_agg(json_build_object('marketplace', marketplace, 'product_url', product_url, 'image_url', image_url, 'position', position) order by position asc) as marketplaces
  from public.product_marketplaces
  group by product_id
),
levels as (
  select product_id, array_agg(level order by level) as levels
  from public.product_levels
  group by product_id
)
select
  p.id,
  p.title,
  p.description,
  p.usage_terms,
  p.value_qp,
  p.stock_status,
  p.stock_count,
  p.category,
  p.is_active,
  b.name as brand_name,
  coalesce(b.logo_url, bp.avatar_url) as brand_logo,
  coalesce(c.cover_url, (select url from public.product_images where product_id = p.id order by position asc limit 1)) as cover_url,
  coalesce(i.images, '[]'::json) as images,
  coalesce(m.marketplaces, '[]'::json) as marketplaces,
  coalesce(l.levels, '{}'::text[]) as levels,
  p.created_at
from public.products p
join public.brands b on b.id = p.brand_id
left join public.brand_profiles bp on bp.brand_id = p.brand_id
left join cover c on c.product_id = p.id
left join images i on i.product_id = p.id
left join markets m on m.product_id = p.id
left join levels l on l.product_id = p.id
where p.is_active = true and p.stock_status <> 'hidden'
order by p.created_at desc;

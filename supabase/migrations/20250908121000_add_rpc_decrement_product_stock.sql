-- Atomically decrement product stock if available
create or replace function public.decrement_product_stock(p_id uuid)
returns public.products
language sql
security definer
as $$
  update public.products
     set stock = stock - 1,
         updated_at = now()
   where id = p_id
     and stock is not null
     and stock > 0
  returning *;
$$;

comment on function public.decrement_product_stock(uuid) is 'Decrements stock by 1 when stock > 0 and returns updated product row';



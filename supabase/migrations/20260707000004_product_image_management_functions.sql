create or replace function set_primary_product_image(
  p_product_id uuid,
  p_image_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
      from product_images
     where id = p_image_id
       and product_id = p_product_id
  ) then
    raise exception 'Product image not found for product';
  end if;

  update product_images
     set is_primary = false
   where product_id = p_product_id;

  update product_images
     set is_primary = true
   where id = p_image_id
     and product_id = p_product_id;
end;
$$;

create or replace function delete_product_image_and_reassign(
  p_image_id uuid
)
returns table(image_url text, product_id uuid, was_primary boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted product_images%rowtype;
  v_next_id uuid;
begin
  delete from product_images
   where id = p_image_id
   returning * into v_deleted;

  if not found then
    raise exception 'Product image not found';
  end if;

  if v_deleted.is_primary then
    select id
      into v_next_id
      from product_images
     where product_images.product_id = v_deleted.product_id
     order by display_order asc, created_at asc
     limit 1;

    if v_next_id is not null then
      update product_images
         set is_primary = true
       where id = v_next_id;
    end if;
  end if;

  return query select v_deleted.image_url, v_deleted.product_id, v_deleted.is_primary;
end;
$$;

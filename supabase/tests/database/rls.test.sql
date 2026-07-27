begin;
select plan(10);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member@example.com', '', now(), '{}', '{"full_name":"Member One"}', now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', '', now(), '{}', '{"full_name":"Admin One"}', now(), now());

update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-000000000002';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-000000000001'$$,
  '42501',
  'permission denied for table profiles',
  'members cannot promote themselves'
);

select throws_ok(
  $$select prompt from public.prompts where access = 'Premium' limit 1$$,
  '42501',
  'permission denied for table prompts',
  'members cannot directly inspect prompt bodies'
);

select is(
  (select prompt from public.get_prompt_catalog() where access = 'Premium' limit 1),
  null,
  'catalog RPC redacts premium bodies for free members'
);

update public.subscriptions set plan = 'Founding', status = 'active', access_until = now() + interval '1 month'
where user_id = '00000000-0000-4000-8000-000000000001';
select is(
  (select plan::text from public.subscriptions where user_id = '00000000-0000-4000-8000-000000000001'),
  'Free',
  'members cannot alter their own subscription'
);

select throws_ok(
  $$insert into public.prompt_requests (user_id, category, title, details)
    values ('00000000-0000-4000-8000-000000000001', 'Business', 'Need a prompt', 'A detailed paid request body')$$,
  '42501',
  'new row violates row-level security policy for table "prompt_requests"',
  'free members cannot create prompt requests'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$select public.admin_update_user_access(
    '00000000-0000-4000-8000-000000000001',
    'user',
    'Founding',
    'active',
    now() + interval '1 month'
  )$$,
  'admins can update access transactionally'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$insert into public.prompt_requests (user_id, category, title, details)
    values ('00000000-0000-4000-8000-000000000001', 'Business', 'Paid member request', 'A sufficiently detailed paid member request')$$,
  'entitled members can create prompt requests'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select is(
  (select prompt is not null from public.get_prompt_catalog() where access = 'Premium' limit 1),
  true,
  'admins receive premium prompt bodies through the catalog RPC'
);

select throws_ok(
  $$select public.admin_update_user_access(
    '00000000-0000-4000-8000-000000000002',
    'user',
    'Free',
    'free',
    null
  )$$,
  'P0001',
  'You cannot remove your own admin access',
  'an administrator cannot remove their own admin role'
);

set local role service_role;
select is(
  (select count(*)::integer from public.prompts where access = 'Premium' and prompt is not null),
  6,
  'service role can manage complete premium catalog rows'
);

select * from finish();
rollback;

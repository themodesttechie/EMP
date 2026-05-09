-- ifBash Sprint 3 — seed ticket categories, SLA defaults, business hours
-- Idempotent: re-runs are safe.

do $$
declare
  v_tenant uuid;
  v_bh     uuid;
  v_it     uuid;
  v_hrit   uuid;
  v_fac    uuid;
begin
  select id into v_tenant from public.tenants where slug = 'ifbash';
  if v_tenant is null then return; end if;

  ----------------------------------------------------------------------------
  -- Business hours: Default 9-5 Mon-Fri Asia/Kolkata
  ----------------------------------------------------------------------------
  insert into public.business_hours (tenant_id, name, timezone, is_default)
  values (v_tenant, 'Default 9-5 Mon-Fri', 'Asia/Kolkata', true)
  on conflict (tenant_id, name) do nothing;

  select id into v_bh from public.business_hours
   where tenant_id = v_tenant and name = 'Default 9-5 Mon-Fri';

  ----------------------------------------------------------------------------
  -- Top-level categories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, 'it',          'IT',          'Hardware, software, network, account access', 'P3', 'agent'),
    (v_tenant, 'hr-it',       'HR-IT',       'Onboarding, offboarding handoffs',             'P3', 'agent'),
    (v_tenant, 'facilities',  'Facilities',  'Office space, power, utilities',               'P3', 'admin')
  on conflict (tenant_id, slug) do nothing;

  select id into v_it   from public.ticket_categories where tenant_id = v_tenant and slug = 'it';
  select id into v_hrit from public.ticket_categories where tenant_id = v_tenant and slug = 'hr-it';
  select id into v_fac  from public.ticket_categories where tenant_id = v_tenant and slug = 'facilities';

  ----------------------------------------------------------------------------
  -- IT subcategories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, v_it, 'it-hardware', 'Hardware', 'Laptops, peripherals, monitors',    'P3', 'agent'),
    (v_tenant, v_it, 'it-software', 'Software', 'Application installs, license keys','P3', 'agent'),
    (v_tenant, v_it, 'it-network',  'Network',  'VPN, wifi, internet, firewall',     'P2', 'agent'),
    (v_tenant, v_it, 'it-access',   'Access',   'Account access, password, MFA',     'P2', 'agent')
  on conflict (tenant_id, slug) do nothing;

  ----------------------------------------------------------------------------
  -- HR-IT subcategories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, v_hrit, 'hrit-onboarding',  'Onboarding',  'New joiner provisioning',     'P3', 'agent'),
    (v_tenant, v_hrit, 'hrit-offboarding', 'Offboarding', 'Leaver deprovisioning',       'P2', 'agent')
  on conflict (tenant_id, slug) do nothing;

  ----------------------------------------------------------------------------
  -- Facilities subcategories
  ----------------------------------------------------------------------------
  insert into public.ticket_categories (tenant_id, parent_id, slug, name, description, default_priority, default_assignment_role)
  values
    (v_tenant, v_fac, 'fac-office',     'Office',     'Office space, seating, AC',        'P3', 'admin'),
    (v_tenant, v_fac, 'fac-power',      'Power',      'Power cuts, UPS, generator',        'P1', 'admin'),
    (v_tenant, v_fac, 'fac-utilities',  'Utilities',  'Water, cleaning, supplies',         'P4', 'admin')
  on conflict (tenant_id, slug) do nothing;

  ----------------------------------------------------------------------------
  -- Default SLA policies (category_id null => default for that priority)
  -- P1 = 15m response / 4h resolve
  -- P2 = 1h / 8h
  -- P3 = 4h / 24h
  -- P4 = 8h / 72h
  ----------------------------------------------------------------------------
  insert into public.sla_policies (tenant_id, category_id, priority, response_minutes, resolution_minutes, business_hours_id)
  values
    (v_tenant, null, 'P1', 15,   240,  v_bh),
    (v_tenant, null, 'P2', 60,   480,  v_bh),
    (v_tenant, null, 'P3', 240,  1440, v_bh),
    (v_tenant, null, 'P4', 480,  4320, v_bh)
  on conflict (tenant_id, category_id, priority) do nothing;
end $$;

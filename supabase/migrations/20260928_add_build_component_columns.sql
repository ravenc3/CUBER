alter table public.builds
  add column if not exists motherboard text not null default '',
  add column if not exists cpu_cooler text not null default '',
  add column if not exists pc_case text not null default '',
  add column if not exists case_fans text not null default '',
  add column if not exists psu text not null default '';

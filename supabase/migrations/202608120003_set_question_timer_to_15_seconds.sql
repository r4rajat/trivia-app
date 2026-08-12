-- Apply after the earlier timer migration. This is the current event setting.
alter table public.questions alter column time_limit set default 15;
update public.questions set time_limit = 15;

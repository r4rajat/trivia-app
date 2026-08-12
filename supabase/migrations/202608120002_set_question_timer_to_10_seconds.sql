-- Apply this migration to existing projects after 202608120001.
-- The game reads the time limit from the database, so all clients stay in sync.
alter table public.questions alter column time_limit set default 10;
update public.questions set time_limit = 10;

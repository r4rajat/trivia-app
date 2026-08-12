-- Public data is intentionally narrow. Correct answers and host/player credentials
-- remain in private tables and are only used by SECURITY DEFINER RPC functions.
create extension if not exists pgcrypto;

create type public.game_status as enum ('LOBBY', 'QUESTION_ACTIVE', 'QUESTION_RESULTS', 'FINISHED');

create table public.games (
  id uuid primary key default gen_random_uuid(),
  game_pin char(6) not null unique check (game_pin ~ '^[0-9]{6}$'),
  title text not null default 'Independence Day Trivia',
  status public.game_status not null default 'LOBBY',
  current_question_index integer not null default 0 check (current_question_index between 0 and 19),
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.game_hosts (
  game_id uuid primary key references public.games(id) on delete cascade,
  host_token uuid not null unique default gen_random_uuid()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  name varchar(24) not null check (char_length(name) between 1 and 24),
  score integer not null default 0 check (score >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  total_response_time numeric(10,3) not null default 0 check (total_response_time >= 0),
  joined_at timestamptz not null default now(),
  unique(game_id, name)
);

create table public.player_sessions (
  player_id uuid primary key references public.players(id) on delete cascade,
  player_token uuid not null unique default gen_random_uuid()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question_order integer not null unique check (question_order between 1 and 20),
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option smallint not null check (correct_option between 0 and 3),
  time_limit integer not null default 15 check (time_limit between 5 and 120),
  points integer not null default 1000 check (points between 1 and 10000)
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  selected_option smallint not null check (selected_option between 0 and 3),
  is_correct boolean not null,
  response_time numeric(10,3) not null check (response_time >= 0),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  submitted_at timestamptz not null default now(),
  unique (game_id, player_id, question_id)
);
create index answers_game_question_idx on public.answers(game_id, question_id);
create index players_leaderboard_idx on public.players(game_id, score desc, correct_answers desc, total_response_time asc);
create unique index players_game_lower_name_key on public.players(game_id, lower(name));

alter table public.games enable row level security;
alter table public.game_hosts enable row level security;
alter table public.players enable row level security;
alter table public.player_sessions enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- Lobby and leaderboard rows are public only because this is a PIN-based event.
create policy "games are readable" on public.games for select using (true);
create policy "players are readable" on public.players for select using (true);

create or replace function public.create_game()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_game public.games; v_token uuid; v_pin text;
begin
  loop
    v_pin := lpad((floor(random() * 1000000))::text, 6, '0');
    begin
      insert into games(game_pin) values (v_pin) returning * into v_game;
      exit;
    exception when unique_violation then
      -- retry collision; six digits is sufficient for small events
    end;
  end loop;
  insert into game_hosts(game_id) values (v_game.id) returning host_token into v_token;
  return jsonb_build_object('game', to_jsonb(v_game), 'host_token', v_token);
end $$;

create or replace function public.join_game(p_game_pin text, p_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_game games; v_player players; v_token uuid; v_name text := regexp_replace(trim(p_name), '\s+', ' ', 'g');
begin
  if v_name is null or char_length(v_name) not between 1 and 24 then raise exception 'Please enter a name of 1–24 characters.'; end if;
  select * into v_game from games where game_pin = p_game_pin and status = 'LOBBY';
  if not found then raise exception 'Game not found or already started.'; end if;
  begin
    insert into players(game_id, name) values (v_game.id, v_name) returning * into v_player;
  exception when unique_violation then raise exception 'That name is already in use in this game.'; end;
  insert into player_sessions(player_id) values (v_player.id) returning player_token into v_token;
  return jsonb_build_object('game', to_jsonb(v_game), 'player', to_jsonb(v_player), 'player_token', v_token);
end $$;

create or replace function public.get_current_question(p_game_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_question questions; v_game games;
begin
  select * into v_game from games where id = p_game_id;
  if not found or v_game.status in ('LOBBY', 'FINISHED') then return null; end if;
  select * into v_question from questions where question_order = v_game.current_question_index + 1;
  return jsonb_build_object('id',v_question.id,'question_order',v_question.question_order,'question_text',v_question.question_text,
    'options',jsonb_build_array(v_question.option_a,v_question.option_b,v_question.option_c,v_question.option_d),'time_limit',v_question.time_limit,'points',v_question.points);
end $$;

create or replace function public.get_answer_stats(p_game_id uuid)
returns table(selected_option smallint, answer_count bigint)
language sql security definer set search_path = public as $$
  select a.selected_option, count(*) from answers a join games g on g.id = a.game_id join questions q on q.question_order = g.current_question_index + 1
  where a.game_id = p_game_id and a.question_id = q.id group by a.selected_option order by a.selected_option;
$$;

create or replace function public.submit_answer(p_game_id uuid, p_player_id uuid, p_player_token uuid, p_selected_option smallint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_game games; v_question questions; v_response numeric; v_correct boolean; v_points integer;
begin
  if p_selected_option not between 0 and 3 then raise exception 'Invalid answer option.'; end if;
  if not exists (select 1 from player_sessions where player_id = p_player_id and player_token = p_player_token) then raise exception 'Player session is invalid.'; end if;
  select * into v_game from games where id = p_game_id for update;
  if not found or v_game.status <> 'QUESTION_ACTIVE' then raise exception 'This question is not accepting answers.'; end if;
  select * into v_question from questions where question_order = v_game.current_question_index + 1;
  v_response := extract(epoch from (now() - v_game.question_started_at));
  if v_response < 0 or v_response > v_question.time_limit then raise exception 'Time is up!'; end if;
  v_correct := p_selected_option = v_question.correct_option;
  -- Correct answers receive 20–100% of base points, scaled by server-measured response time.
  v_points := case when v_correct then round(v_question.points * greatest(0.2, (v_question.time_limit - v_response) / v_question.time_limit)) else 0 end;
  insert into answers(game_id,player_id,question_id,selected_option,is_correct,response_time,points_awarded)
  values(p_game_id,p_player_id,v_question.id,p_selected_option,v_correct,v_response,v_points);
  update players set score = score + v_points, correct_answers = correct_answers + case when v_correct then 1 else 0 end,
    total_response_time = total_response_time + v_response where id = p_player_id and game_id = p_game_id;
  if not found then raise exception 'Player does not belong to this game.'; end if;
  return jsonb_build_object('points_awarded',v_points);
exception when unique_violation then raise exception 'You have already answered this question.';
end $$;

create or replace function public.control_game(p_game_id uuid, p_host_token uuid, p_action text)
returns public.games language plpgsql security definer set search_path = public as $$
declare v_game games;
begin
  if not exists(select 1 from game_hosts where game_id = p_game_id and host_token = p_host_token) then raise exception 'Host session is invalid.'; end if;
  select * into v_game from games where id = p_game_id for update;
  if p_action = 'start' and v_game.status = 'LOBBY' then
    update games set status='QUESTION_ACTIVE', question_started_at=now() where id=p_game_id returning * into v_game;
  elsif p_action = 'next' and v_game.status = 'QUESTION_ACTIVE' then
    update games set status='QUESTION_RESULTS' where id=p_game_id returning * into v_game;
  elsif p_action = 'next' and v_game.status = 'QUESTION_RESULTS' then
    if v_game.current_question_index = 19 then update games set status='FINISHED', question_started_at=null where id=p_game_id returning * into v_game;
    else update games set current_question_index=current_question_index+1,status='QUESTION_ACTIVE',question_started_at=now() where id=p_game_id returning * into v_game; end if;
  elsif p_action = 'end' and v_game.status <> 'FINISHED' then
    update games set status='FINISHED', question_started_at=null where id=p_game_id returning * into v_game;
  else raise exception 'This action is not available right now.';
  end if;
  return v_game;
end $$;

grant usage on schema public to anon;
grant select on public.games, public.players to anon;
grant execute on function public.create_game(), public.join_game(text,text), public.get_current_question(uuid), public.get_answer_stats(uuid), public.submit_answer(uuid,uuid,uuid,smallint), public.control_game(uuid,uuid,text) to anon;

alter publication supabase_realtime add table public.games, public.players, public.answers;

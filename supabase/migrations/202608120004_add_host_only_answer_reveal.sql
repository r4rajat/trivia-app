-- Host-only correct-answer reveal, available only in QUESTION_RESULTS.
create or replace function public.get_correct_option(p_game_id uuid, p_host_token uuid)
returns smallint language plpgsql security definer set search_path = public as $$
declare v_game public.games; v_option smallint;
begin
  if not exists (select 1 from public.game_hosts where game_id = p_game_id and host_token = p_host_token) then
    raise exception 'Host session is invalid.';
  end if;
  select * into v_game from public.games where id = p_game_id;
  if not found or v_game.status <> 'QUESTION_RESULTS' then
    raise exception 'The correct answer is available after the question ends.';
  end if;
  select correct_option into v_option from public.questions where question_order = v_game.current_question_index + 1;
  return v_option;
end $$;

grant execute on function public.get_correct_option(uuid, uuid) to anon;

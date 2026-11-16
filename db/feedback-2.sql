-- Колія: оценки «Информация помогла? 👍 / 👎» на страницах маршрутов (этап 2 обратной связи)
-- Выполнить в Supabase → SQL Editor ПОСЛЕ db/feedback-1.sql и ДО слияния изменений в main. Повторный запуск безопасен.
-- Оценка — это строка feedback с kind = 'up' / 'down'. У 👍 текста нет, и он сразу «обработан», чтобы не попадать в новые;
-- у 👎 текст («Что не так?») необязателен.
begin;

alter table public.feedback drop constraint if exists feedback_kind_check;
alter table public.feedback add constraint feedback_kind_check
    check (kind in ('data', 'idea', 'question', 'other', 'up', 'down'));

alter table public.feedback drop constraint if exists feedback_message_check;
alter table public.feedback add constraint feedback_message_check
    check (char_length(message) <= 2000 and (kind in ('up', 'down') or char_length(btrim(message)) >= 5));

-- 👍 не требует внимания: при добавлении сразу ставим «обработано»
create or replace function public.feedback_set_status() returns trigger
language plpgsql as $$
begin
    if new.kind = 'up' then new.status := 'done'; end if;
    return new;
end $$;
drop trigger if exists feedback_set_status on public.feedback;
create trigger feedback_set_status before insert on public.feedback
    for each row execute function public.feedback_set_status();

-- политика проверяет уже итоговую строку (после триггера)
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback for insert to anon, authenticated
    with check (note = '' and status = case when kind = 'up' then 'done' else 'new' end);

select kind, count(*) from public.feedback group by kind order by kind;
commit;

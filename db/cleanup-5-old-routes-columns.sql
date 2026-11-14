-- Колія: убираем из таблицы routes колонки старых текстов lead, how, tickets (сайт их не читает, старая админка удалена).
-- Тексты сохраняются в схеме backup_2026_11_14 (удалить позже: drop schema backup_2026_11_14 cascade;).
-- Выполнить в Supabase → SQL Editor. Повторный запуск безопасен.
begin;

create schema if not exists backup_2026_11_14;
create table if not exists backup_2026_11_14.routes_texts as
    select slug, lead, how, tickets from public.routes where coalesce(lead, '') <> '' or coalesce(how, '') <> '' or coalesce(tickets, '') <> '';

alter table public.routes drop column if exists lead, drop column if exists how, drop column if exists tickets;

select (select count(*) from backup_2026_11_14.routes_texts) as saved_rows,
       (select string_agg(column_name, ', ' order by ordinal_position) from information_schema.columns where table_schema = 'public' and table_name = 'routes') as routes_columns;
commit;

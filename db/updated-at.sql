-- Дата «Информация на сайте обновлена» в подвале считается по последнему updated_at любых данных:
-- options (варианты маршрутов), route_pages (страницы направлений, в том числе «Как купить билеты») и ui_texts (тексты).
-- Выполнить один раз в Supabase → SQL Editor. Повторный запуск безопасен.

-- 1) route_pages: колонка updated_at (у существующих записей = дата создания, чтобы дата в подвале не прыгнула на сегодня)
alter table public.route_pages add column if not exists updated_at timestamptz;
update public.route_pages set updated_at = coalesce(created_at, now()) where updated_at is null;
alter table public.route_pages alter column updated_at set default now();

-- 2) при любом изменении записи (из админки, SQL или скрипта) updated_at обновляется сам
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end $$;
drop trigger if exists route_pages_touch_updated_at on public.route_pages;
create trigger route_pages_touch_updated_at before insert or update on public.route_pages
    for each row execute function public.touch_updated_at();

-- 3) подпись в подвале (дату подставляет сайт, {date} менять не нужно); updated_at здесь намеренно не трогаем
update public.ui_texts set
    ru = 'Информация на сайте обновлена: {date}.',
    uk = 'Інформацію на сайті оновлено: {date}.',
    en = 'Site information last updated: {date}.',
    pl = 'Informacje w serwisie zaktualizowano: {date}.'
where key = 'f2b';

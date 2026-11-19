-- Колия: блок «Как купить билеты» без опций. Шаг 2 из 2: удаляем всё, что осталось от старых настроек.
--   * route_pages.extra: ключи старых опций (uz, pkp, t3, car, s1, s2, ds2, ds3, one, app, h, third, be, cols, xs, hxs … ) и мёртвые x, plat, dOnly, splitx
--   * route_pages.single   («на направлении один поезд» нужен был только для текста покупки)
--   * ui_texts: все тексты buy.* (кроме заголовка раздела buy.h) и transfer.h, transfer.h2 — их больше никто не читает
-- Копия удаляемого остаётся в схеме backup_2026_11_19 (убрать позже: drop schema backup_2026_11_19 cascade;).
-- Выполнить в Supabase → SQL Editor ПОСЛЕ db/buy-blocks-1-add.sql, после слияния изменений и пересборки сайта
-- (новый код уже не читает эти ключи). Затем нажмите «Пересобрать сайт», чтобы ключи исчезли из словарей сайта (dict/*.js).
-- Повторный запуск безопасен.
begin;

create schema if not exists backup_2026_11_19;
-- single мог быть уже удалён (повторный запуск), поэтому копия берёт его только если колонка ещё есть
do $$
begin
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'route_pages' and column_name = 'single') then
        execute 'create table if not exists backup_2026_11_19.route_pages_before as select id, extra, single from public.route_pages';
    else
        execute 'create table if not exists backup_2026_11_19.route_pages_before as select id, extra from public.route_pages';
    end if;
end $$;
create table if not exists backup_2026_11_19.ui_texts_removed as
    select * from public.ui_texts
    where (key like 'buy.%' and key <> 'buy.h') or key in ('transfer.h', 'transfer.h2');

update public.route_pages
set extra = coalesce(extra::jsonb, '{}'::jsonb)
    - 't3' - 'uz' - 'pkp' - 'x' - 'ds2' - 'ds3' - 'dOnly' - 'one' - 'plat' - 'app' - 's1' - 's2' - 'car' - 'h' - 'third'
    - 'hb1' - 'hb2' - 'hb1k' - 'hb2k' - 'be' - 'hs1' - 'hs2' - 'hxs' - 'uz3' - 'pkp3' - 'hurl' - 'cols' - 'xs' - 'xb2'
    - 'xs2i' - 'xs2o' - 'splitx'
where extra is not null;

alter table public.route_pages drop column if exists single;

delete from public.ui_texts
where (key like 'buy.%' and key <> 'buy.h') or key in ('transfer.h', 'transfer.h2');

select (select count(*) from backup_2026_11_19.ui_texts_removed) as texts_removed,
       (select count(*) from public.ui_texts) as texts_left;
commit;

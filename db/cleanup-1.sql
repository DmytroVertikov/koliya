-- Колія: чистка базы, шаг 1.
-- Выполнять целиком в Supabase → SQL Editor. Всё в одной транзакции: при ошибке ничего не меняется.
-- Перед изменениями копии затрагиваемых таблиц сохраняются в схеме backup_2026_11_14
-- (она не доступна через API сайта; удалить позже можно командой: drop schema backup_2026_11_14 cascade;).

begin;

-- 0. Резервные копии
create schema if not exists backup_2026_11_14;
create table backup_2026_11_14.options_legacy as table public.options_legacy;
create table backup_2026_11_14.routes         as table public.routes;
create table backup_2026_11_14.stations       as table public.stations;

-- 1. Старая таблица вариантов в текстовом формате. Сайт и админка читают вью public.options,
--    которое строится из connections; на options_legacy не ссылается ни код, ни вью.
drop table public.options_legacy;

-- 2. Две «пустые» записи направлений: без страны, без вариантов и без страницы
--    (остались от пробного создания Киев ↔ Катовице)
delete from public.routes r
 where r.slug in ('kyiv-katovytse', 'katovytse-kyiv')
   and r.country is null
   and not exists (select 1 from public.connections c where c.route_slug = r.slug)
   and not exists (select 1 from public.route_pages p where p.file = r.slug || '.html');

-- 3. Дубли станций: {оставить, удалить}. Удаляется только дубль, на который не ссылается ни один поезд.
--    Название удалённого дубля добавляется в aliases оставшейся станции, поэтому поиск и страницы продолжают его находить.
do $$
declare
    p text[];
    keep_id int;
    dup_id  int;
begin
    foreach p slice 1 in array array[
        ['Кишинев',            'Кишинёв'],
        ['Варшава Всходня',    'Варшава Восточная'],
        ['Варшава Заходня',    'Варшава Западная'],
        ['Варшава Центральная','Варшава Центральна']
    ] loop
        select id into keep_id from public.stations where name_ru = p[1];
        select id into dup_id  from public.stations where name_ru = p[2];
        if keep_id is null or dup_id is null then
            raise notice 'Пропуск пары % / %: одной из станций нет', p[1], p[2];
            continue;
        end if;
        if exists (select 1 from public.train_stops where station_id = dup_id) then
            raise notice 'Пропуск: станция "%" используется в расписании поездов', p[2];
            continue;
        end if;
        delete from public.stations where id = dup_id;
        update public.stations
           set aliases = array_append(aliases, p[2])
         where id = keep_id and not (p[2] = any (aliases));
        raise notice 'Слито: "%" → "%"', p[2], p[1];
    end loop;
end $$;

-- 4. Проверка результата (должно быть: options_legacy нет; routes без пустых записей; 242 станции)
select to_regclass('public.options_legacy') as options_legacy_exists,
       (select count(*) from public.routes)   as routes,
       (select count(*) from public.stations) as stations,
       (select count(*) from public.routes where country is null) as routes_without_country;

commit;

-- ---------------------------------------------------------------------------------------------
-- НЕОБЯЗАТЕЛЬНО (не входит в транзакцию выше, выполнять отдельно после проверки сайта):
-- тексты интерфейса, которые нигде не используются ни в коде, ни в параметрах страниц:
--   delete from public.ui_texts where key in ('buy.s1', 'ix.one', 'buy.t.s1z', 'ix.help.b1', 'ix.help.b2');
-- ---------------------------------------------------------------------------------------------

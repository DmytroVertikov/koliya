-- Колія: удаляем 7 текстов интерфейса, которыми не пользуется ни код сайта, ни админка
--   buy.s1, buy.t.s1z       старые шаги покупки (их заменили другие ключи)
--   ix.one                  шаблон «⚡ {t} →»
--   ix.buy.b1, ix.buy.b2    кнопки «Где купить» (теперь таблица home_links)
--   ix.help.b1, ix.help.b2  ссылки блока помощи (теперь таблица home_links)
-- Копия удаляемых строк остаётся в схеме backup_2026_11_16 (убрать позже: drop schema backup_2026_11_16 cascade;).
-- Выполнить в Supabase → SQL Editor. Повторный запуск безопасен. После этого нажмите «Пересобрать сайт»,
-- чтобы ключи исчезли и из словарей сайта (dict/*.js).
begin;

create schema if not exists backup_2026_11_16;
create table if not exists backup_2026_11_16.ui_texts_removed as
    select * from public.ui_texts
    where key in ('buy.s1', 'buy.t.s1z', 'ix.one', 'ix.buy.b1', 'ix.buy.b2', 'ix.help.b1', 'ix.help.b2');

delete from public.ui_texts
where key in ('buy.s1', 'buy.t.s1z', 'ix.one', 'ix.buy.b1', 'ix.buy.b2', 'ix.help.b1', 'ix.help.b2');

select (select count(*) from backup_2026_11_16.ui_texts_removed) as saved_rows,
       (select count(*) from public.ui_texts) as texts_left;
commit;

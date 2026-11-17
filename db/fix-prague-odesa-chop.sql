-- Колія: у страницы Прага → Одесса в блоке покупки станция пересадки была введена в английской раскладке («Xjg» вместо «Чоп»),
-- из-за этого в тексте страницы появлялось «Xjg». Исправляем на «Чоп». Выполнить в Supabase → SQL Editor, затем «Пересобрать сайт».
-- Повторный запуск безопасен.
begin;

update public.route_pages
set extra = jsonb_set(extra::jsonb, '{cols}', (
    select jsonb_agg(case when c->>'x' = 'Xjg' then jsonb_set(c, '{x}', '"Чоп"') else c end order by n)
    from jsonb_array_elements(extra::jsonb->'cols') with ordinality as t(c, n)
))
where id = 'prague_odesa' and extra::jsonb->'cols' is not null;

select id, extra from public.route_pages where id = 'prague_odesa';
commit;

-- Колия: Львов ↔ Прага, блоки про Чоп.
-- 1) Львов → Чоп, поезд 833Л: продажа открывается за 10 суток до отправления.
-- 2) Чоп → Львов, поезд 003Л: продажа за 2 суток до отправления, в 11:12 (время отправления 003Л из Ужгорода;
--    сайт берёт его из остановок варианта, 11:12 — запасное значение).
-- 3) У страницы Прага → Львов исправлены билеты: УЗ — Чоп → Львов (было Прага → Чоп), второй перевозчик — Прага → Чоп.
-- Выполнить в Supabase → SQL Editor, затем «Пересобрать сайт». Повторный запуск безопасен.
begin;

update public.route_pages
set extra = coalesce(extra::jsonb, '{}'::jsonb) || jsonb_build_object('cols', jsonb_build_array(
    jsonb_build_object('x', 'Чоп', 'uz', jsonb_build_array('Львов', 'Чоп'), 'car', 'rj',
                       'pkp', jsonb_build_array('Чоп', 'Прага'), 'train', '833Л', 'days', 10),
    jsonb_build_object('x', 'Перемышль', 'uz', jsonb_build_array('Львов', 'Перемышль'), 'car', 'rj',
                       'pkp', jsonb_build_array('Перемышль', 'Прага'), 'open', '09:00', 'train', '715К')
))
where id = 'lviv_prague';

update public.route_pages
set extra = coalesce(extra::jsonb, '{}'::jsonb) || jsonb_build_object('cols', jsonb_build_array(
    jsonb_build_object('x', 'Чоп', 'uz', jsonb_build_array('Чоп', 'Львов'), 'car', 'rj',
                       'pkp', jsonb_build_array('Прага', 'Чоп'), 'train', '003Л',
                       'days', 2, 'sale_at', 'Ужгород', 'sale_time', '11:12'),
    jsonb_build_object('x', 'Перемышль', 'uz', jsonb_build_array('Перемышль', 'Львов'), 'car', 'rj',
                       'pkp', jsonb_build_array('Прага', 'Перемышль'), 'open', '09:00', 'train', '706Л')
))
where id = 'prague_lviv';

select id, extra from public.route_pages where id in ('lviv_prague', 'prague_lviv');
commit;

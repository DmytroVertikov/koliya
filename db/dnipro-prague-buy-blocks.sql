-- Колія: на странице Днепр → Прага блок «Как купить билеты» делится на два: пересадка в Перемышле и пересадка в Чопе.
-- В каждом блоке своя инструкция: поезд УЗ + поезд RegioJet. Номер поезда УЗ и время сайт подставляет сам из подходящего варианта.
-- Выполнить в Supabase → SQL Editor, затем нажать «Пересобрать сайт» в админке. Повторный запуск безопасен.
begin;

update public.route_pages
set extra = (coalesce(extra::jsonb, '{}'::jsonb) || jsonb_build_object('cols', jsonb_build_array(
    jsonb_build_object('x', 'Перемышль', 'uz', jsonb_build_array('Днепр', 'Перемышль Главный'), 'car', 'rj',
                       'pkp', jsonb_build_array('Перемышль Главный', 'Прага'), 'open', '09:00', 'train', '073П'),
    jsonb_build_object('x', 'Чоп', 'uz', jsonb_build_array('Днепр', 'Чоп'), 'car', 'rj',
                       'pkp', jsonb_build_array('Чоп', 'Прага'), 'train', '003П')
)))
where id = 'dnipro_prague';

select id, extra from public.route_pages where id = 'dnipro_prague';
commit;

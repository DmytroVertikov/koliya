-- Колія: пометки у поездов («сидячий», «по нечётным», «по чётным») теперь целиком в базе (trains.badge),
-- а не в списке TRAIN_BADGES в common.js. Выполнить в Supabase → SQL Editor ДО слияния изменений в main. Повторный запуск безопасен.
begin;

alter table public.trains drop constraint if exists trains_badge_check;
alter table public.trains add constraint trains_badge_check check (badge is null or badge in ('seat', 'odd', 'even'));

-- те же поезда, что были в common.js (train_key сам игнорирует регистр, пробелы, ведущие нули и латинские K / O)
update public.trains set badge = 'seat' where public.train_key(number) in (public.train_key('705К'), public.train_key('715К'), public.train_key('706Л'), public.train_key('716Л'));
update public.trains set badge = 'odd'  where public.train_key(number) = public.train_key('070О');
update public.trains set badge = 'even' where public.train_key(number) = public.train_key('070К');

select badge, string_agg(number, ', ' order by number) as trains from public.trains where badge is not null group by badge order by badge;
commit;

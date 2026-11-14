-- Колія: «популярные» маршруты на главной (показываются сразу, остальные в раскрывающемся списке) теперь отмечаются
-- галочкой во вкладке «Направления» (колонка route_pages.popular), а не списком POP в build.js.
-- Выполнить в Supabase → SQL Editor ДО слияния изменений в main. Повторный запуск безопасен.
begin;

alter table public.route_pages add column if not exists popular boolean not null default false;

-- те же семь страниц, что были в build.js (для остальных стран на главной по-прежнему показываются все маршруты)
update public.route_pages set popular = true
 where file in ('kyiv-warsaw.html', 'kyiv-krakow.html', 'dnipro-warsaw.html', 'odesa-warsaw.html', 'lviv-warsaw.html', 'warsaw-kyiv.html', 'krakow-kyiv.html');

select count(*) filter (where popular) as popular_pages, count(*) as all_pages from public.route_pages;
commit;

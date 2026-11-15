-- Исправления переводов станций (в отличие от fill-station-translations.sql ПЕРЕЗАПИСЫВАЮТ поля).
-- Выполнить в Supabase → SQL Editor, затем «Пересобрать сайт».
update public.stations set name_uk = 'Велчинець', name_en = 'Vălcineț', name_pl = 'Vălcineț' where name_ru = 'Вэлчинец';
update public.stations set name_uk = 'Кострино', name_en = 'Kostryno', name_pl = 'Kostryno' where name_ru = 'Кострино';
update public.stations set name_uk = 'Ніколіна', name_en = 'Nikolina', name_pl = 'Nikolina' where name_ru = 'Николина';
update public.stations set name_uk = 'Пілява', name_en = 'Pilawa', name_pl = 'Pilawa' where name_ru = 'Пилава';
update public.stations set name_uk = 'Феріхедь', name_en = 'Ferihegy', name_pl = 'Ferihegy' where name_ru = 'Ферихедь';
update public.stations set name_uk = 'Перемишль-Головний', name_en = 'Przemyśl Główny', name_pl = 'Przemyśl Główny' where name_ru = 'Перемышль Главный';
update public.stations set name_en = 'Dębica', name_pl = 'Dębica' where name_ru = 'Дембица';
update public.stations set name_en = 'Dęblin' where name_ru = 'Демблин';
update public.stations set name_en = 'Łańcut', name_pl = 'Łańcut' where name_ru = 'Ланьцут';
update public.stations set name_en = 'Zbąszynek', name_pl = 'Zbąszynek' where name_ru = 'Збоншинек';
update public.stations set name_en = 'Zbąszyń', name_pl = 'Zbąszyń' where name_ru = 'Збоншинь';
update public.stations set name_en = 'Żyrardów' where name_ru = 'Жирардув';
update public.stations set name_en = 'Nałęczów' where name_ru = 'Наленчув';
update public.stations set name_en = 'Nowy Tomyśl', name_pl = 'Nowy Tomyśl' where name_ru = 'Новы Томысль';
update public.stations set name_uk = 'Нова Соль' where name_ru = 'Нова Суль';
update public.stations set name_uk = 'Ясси', in_uk = 'у Яссах' where name_ru = 'Яссы';
update public.stations set in_uk = 'у Пйотркуві-Куявському' where name_ru = 'Пётркув Куявский';
update public.stations set in_uk = 'у Островці-Свєнтокшиському' where name_ru = 'Островец Свентокшиский';
update public.stations set name_pl = 'Kamianske-Pas.', in_pl = null where name_ru = 'Каменское-Пасс.';
update public.stations set name_pl = 'Sławsko', in_pl = 'w Sławsku' where name_ru = 'Славское';

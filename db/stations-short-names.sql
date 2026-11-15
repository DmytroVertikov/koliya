-- Короткие названия станций для заголовка карточки поезда (в «Подробнее» остаются полные).
-- Выполнить один раз в Supabase → SQL Editor.
alter table public.stations
  add column if not exists short_ru text,
  add column if not exists short_uk text,
  add column if not exists short_en text,
  add column if not exists short_pl text;

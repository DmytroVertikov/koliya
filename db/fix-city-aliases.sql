-- Названия «Краков» и «Перемышль» встречаются в заголовках страниц, но у станций они записаны как «Краков Главный» / «Перемышль Главный»
-- и не были их псевдонимами, поэтому на uk/en/pl-версиях эти города оставались по-русски. Выполнить в Supabase → SQL Editor, затем «Пересобрать сайт».
update public.stations set aliases = array_append(coalesce(aliases, '{}'), 'Краков')
  where name_ru = 'Краков Главный' and not ('Краков' = any(coalesce(aliases, '{}')));
update public.stations set aliases = array_append(coalesce(aliases, '{}'), 'Перемышль')
  where name_ru = 'Перемышль Главный' and not ('Перемышль' = any(coalesce(aliases, '{}')));
-- короткое название Кракова (переводы названий уже есть в других полях)
update public.stations set short_ru = 'Краков', short_uk = 'Краків', short_en = 'Kraków', short_pl = 'Kraków'
  where name_ru = 'Краков Главный' and short_ru is null;

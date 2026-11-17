-- Колія: главная называется «Поездом из Украины в Европу» (заголовок H1 и title страницы, 4 языка).
-- Выполнить в Supabase → SQL Editor ДО нажатия «Пересобрать сайт» (иначе сборка заберёт старые тексты из базы). Повторный запуск безопасен.
begin;
update public.ui_texts set ru = 'Поездом из Украины в Европу', uk = 'Потягом з України до Європи', en = 'By train from Ukraine to Europe', pl = 'Pociągiem z Ukrainy do Europy', updated_at = now() where key = 'ix.h1';
update public.ui_texts set ru = 'Колія: поездом из Украины в Европу', uk = 'Колія: потягом з України до Європи', en = 'Koliya: by train from Ukraine to Europe', pl = 'Koliya: pociągiem z Ukrainy do Europy', updated_at = now() where key = 'ix.title';
select key, ru, uk, en, pl from public.ui_texts where key in ('ix.h1', 'ix.title');
commit;

-- Колія: русские формы названий стран для главной («Из Украины в Польшу», «Из Польши в Украину»).
-- Раньше они были зашиты в build.js. Теперь лежат в ui_texts: cn.<код> (ru = «в …», винительный) и cn.<код>.gen (ru = «из …», родительный).
-- Выполнить в Supabase → SQL Editor ДО слияния изменений в main. Повторный запуск безопасен.
insert into public.ui_texts (key, ru) values
    ('cn.pl',     'Польшу'),    ('cn.pl.gen', 'Польши'),
    ('cn.cz',     'Чехию'),     ('cn.cz.gen', 'Чехии'),
    ('cn.hu',     'Венгрию'),   ('cn.hu.gen', 'Венгрии'),
    ('cn.at',     'Австрию'),   ('cn.at.gen', 'Австрии'),
    ('cn.sk',     'Словакию'),  ('cn.sk.gen', 'Словакии'),
    ('cn.md',     'Молдову'),   ('cn.md.gen', 'Молдовы'),
    ('cn.ro',     'Румынию'),   ('cn.ro.gen', 'Румынии'),
    ('cn.de',     'Германию'),  ('cn.de.gen', 'Германии')
on conflict (key) do update set ru = excluded.ru, updated_at = now();

select key, ru, uk, en, pl from public.ui_texts where key like 'cn.%' order by key;

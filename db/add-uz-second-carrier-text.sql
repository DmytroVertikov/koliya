-- Текст пункта 2 в блоке «Как купить билеты», когда оба поезда пересадки — Укрзалізниці (второй перевозчик «УЗ» в админке).
-- Выполните в Supabase → SQL Editor, иначе «Пересобрать сайт» уберёт этот текст из снимка i18n.db.json.
insert into public.ui_texts (key, ru, uk, en, pl) values
    ('buy.t.s2uz', 'Поезд из {a} в {b} отправляется на следующие сутки, поэтому продажа билетов на него в приложении «Укрзалізниця» открывается на следующий день.', 'Поїзд із {a} до {b} відправляється наступної доби, тому продаж квитків на нього в застосунку «Укрзалізниця» відкривається наступного дня.', 'The train from {a} to {b} departs the next day, so ticket sales for it in the Ukrzaliznytsia app open the next day.', 'Pociąg z {a} do {b} odjeżdża następnej doby, dlatego sprzedaż biletów na niego w aplikacji Ukrzaliznytsia rusza następnego dnia.')
on conflict (key) do update set ru = excluded.ru, uk = excluded.uk, en = excluded.en, pl = excluded.pl, updated_at = now();

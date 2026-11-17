-- Пункт 2 блока «Как купить билеты» на страницах Киев → Кошице: продажа открывается на следующий день, ZSSK — запасной вариант.
-- Выполните в Supabase → SQL Editor (или вставьте тексты во вкладке «Тексты» админки, ключ buy.x.s2z), иначе «Пересобрать сайт» вернёт старый текст.
update public.ui_texts set
    ru = 'Поезда {xp} отправляются на следующие сутки, поэтому продажа билетов на них в приложении «Укрзалізниця» открывается на следующий день. Если хотите приобрести билет заранее, его можно отдельно купить в приложении словацкого перевозчика ZSSK. Как правило, билеты у ZSSK дешевле.',
    uk = 'Поїзди {xp} відправляються наступної доби, тому продаж квитків на них у застосунку «Укрзалізниця» відкривається наступного дня. Якщо хочете придбати квиток заздалегідь, його можна окремо купити в застосунку словацького перевізника ZSSK. Як правило, квитки в ZSSK дешевші.',
    en = 'The trains {xp} depart the next day, so ticket sales for them in the Ukrzaliznytsia app open the next day. If you want to buy a ticket in advance, you can buy it separately in the app of the Slovak carrier ZSSK. ZSSK tickets are usually cheaper.',
    pl = 'Pociągi {xp} odjeżdżają następnej doby, dlatego sprzedaż biletów na nie w aplikacji Ukrzaliznytsia rusza następnego dnia. Jeśli chcesz kupić bilet wcześniej, możesz kupić go osobno w aplikacji słowackiego przewoźnika ZSSK. Zwykle bilety ZSSK są tańsze.',
    updated_at = now()
where key = 'buy.x.s2z';

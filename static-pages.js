/* Тексты служебных страниц: конфиденциальность, о проекте, контакты. Подключается из build.js (node build.js).
   Это обычные HTML-фрагменты на четырёх языках. Правьте здесь и запустите node build.js.
   Если появится реклама, статистика (Google Analytics и т.п.) или другой сбор данных, обязательно обновите раздел
   «Реклама и статистика» в privacy и дату UPDATED. */
/* Google Analytics включён, если в config.js задан GA_ID (например "G-XXXXXXXXXX"): тогда политика описывает статистику и cookie с согласием */
const GA = (() => { try { return /GA_ID:\s*"G-[A-Z0-9]+"/.test(require("fs").readFileSync("config.js", "utf8")) } catch (e) { return false } })();
const TXG = {
  ru: {sum: ["Сайт не использует рекламу и статистику посетителей.", "Рекламы на сайте нет, а статистика посещений включается только с вашего согласия."],
    ck: ["Сайт не устанавливает собственные cookie.", "Сайт не устанавливает собственные cookie. Cookie статистики (Google Analytics) появляются только если вы согласились в баннере."],
    li: ["", "<li>Google Analytics: статистика посещений, только после вашего согласия.</li>"],
    an: ["Сейчас на сайте нет рекламы и нет инструментов статистики посетителей. Если они появятся, мы обновим эту страницу и, где требуется, запросим ваше согласие.", "На сайте нет рекламы. Если вы разрешите это в баннере, мы используем Google Analytics для статистики посещений: какие страницы открывают, из какой страны и с какого устройства. Для этого Google устанавливает cookie и получает данные вашего запроса, включая IP-адрес, и может передавать их за пределы ЕС. Без вашего согласия статистика не подключается. Согласие можно изменить или отозвать в любой момент по ссылке «Настройки cookie» внизу страницы."]},
  uk: {sum: ["Сайт не використовує рекламу й статистику відвідувачів.", "Реклами на сайті немає, а статистика відвідувань вмикається лише за вашою згодою."],
    ck: ["Сайт не встановлює власні cookie.", "Сайт не встановлює власні cookie. Cookie статистики (Google Analytics) з’являються лише якщо ви погодилися в банері."],
    li: ["", "<li>Google Analytics: статистика відвідувань, лише після вашої згоди.</li>"],
    an: ["Зараз на сайті немає реклами й інструментів статистики відвідувачів. Якщо вони з’являться, ми оновимо цю сторінку та, де потрібно, запитаємо вашу згоду.", "На сайті немає реклами. Якщо ви дозволите це в банері, ми використовуємо Google Analytics для статистики відвідувань: які сторінки відкривають, з якої країни та з якого пристрою. Для цього Google встановлює cookie та отримує дані вашого запиту, зокрема IP-адресу, і може передавати їх за межі ЄС. Без вашої згоди статистика не підключається. Згоду можна змінити або відкликати будь-коли за посиланням «Налаштування cookie» внизу сторінки."]},
  en: {sum: ["The site does not use advertising or visitor analytics.", "The site shows no advertising, and visit statistics are switched on only with your consent."],
    ck: ["The site does not set its own cookies.", "The site does not set its own cookies. Analytics cookies (Google Analytics) appear only if you agree in the banner."],
    li: ["", "<li>Google Analytics: visit statistics, only after your consent.</li>"],
    an: ["The site currently shows no advertising and uses no visitor analytics. If that changes, we will update this page and, where required, ask for your consent.", "The site shows no advertising. If you allow it in the banner, we use Google Analytics for visit statistics: which pages are opened, from which country and on which device. For this, Google sets cookies and receives data about your request, including your IP address, and may transfer it outside the EU. Without your consent no analytics is loaded. You can change or withdraw your consent at any time with the “Cookie settings” link at the bottom of the page."]},
  pl: {sum: ["Serwis nie korzysta z reklam ani statystyk odwiedzin.", "Serwis nie wyświetla reklam, a statystyki odwiedzin włączają się tylko za Twoją zgodą."],
    ck: ["Serwis nie ustawia własnych plików cookie.", "Serwis nie ustawia własnych plików cookie. Cookie statystyczne (Google Analytics) pojawiają się tylko wtedy, gdy wyrazisz zgodę w banerze."],
    li: ["", "<li>Google Analytics: statystyki odwiedzin, tylko po Twojej zgodzie.</li>"],
    an: ["Obecnie serwis nie wyświetla reklam i nie korzysta ze statystyk odwiedzin. Jeśli to się zmieni, zaktualizujemy tę stronę i, gdy jest to wymagane, poprosimy o zgodę.", "Serwis nie wyświetla reklam. Jeśli wyrazisz zgodę w banerze, korzystamy z Google Analytics do statystyk odwiedzin: które strony są otwierane, z jakiego kraju i na jakim urządzeniu. W tym celu Google ustawia pliki cookie i otrzymuje dane o Twoim żądaniu, w tym adres IP, i może przekazywać je poza UE. Bez Twojej zgody statystyki nie są ładowane. Zgodę możesz w każdej chwili zmienić lub wycofać linkiem „Ustawienia cookie” na dole strony."]}
};
const G = l => ({sum: TXG[l].sum[+GA], ck: TXG[l].ck[+GA], li: TXG[l].li[+GA], an: TXG[l].an[+GA]});
const UPDATED = {ru: "19.11.2026", uk: "19.11.2026", en: "19 November 2026", pl: "19.11.2026"};
const FB = (k, label) => `<p><button type="button" class="btn pri fb-open" data-fb="${k}">${label}</button></p>`;

const P = {
  about: {
    ru: {
      title: "О проекте | Колія", desc: "«Колія» — независимый справочник железнодорожных маршрутов из Украины и в Украину: расписания, пересадки, как купить билеты.",
      h1: "О проекте", lead: "Независимый справочник поездов из Украины и в Украину.",
      html: `<section class="panel"><h2>Что такое «Колія»</h2>
<p>«Колія» помогает спланировать поездку поездом между Украиной и странами Европы: показывает прямые поезда и варианты с пересадкой, время в пути, станции пересадок и подсказывает, где и как купить билеты на каждый участок маршрута.</p>
<p>Многие маршруты состоят из нескольких поездов разных перевозчиков, и информацию о них приходится собирать на нескольких сайтах. Здесь она собрана в одном месте на русском, украинском, английском и польском языках.</p></section>
<section class="panel"><h2>Откуда данные</h2>
<p>Расписания и варианты маршрутов составлены по данным перевозчиков: Укрзалізниця, PKP Intercity, RegioJet, České dráhy, ZSSK, MÁV, ÖBB, CFR Călători, Deutsche Bahn. Список источников указан в подвале сайта, а дата обновления информации показана на странице.</p>
<p>Расписания меняются, поэтому перед поездкой обязательно проверяйте актуальные данные на сайте перевозчика.</p></section>
<section class="panel"><h2>Что «Колія» не делает</h2>
<p>Мы не продаём билеты и не принимаем платежи. Кнопки «Как купить билеты» ведут на официальные сайты и приложения перевозчиков. «Колія» — независимый информационный проект, не связанный с АО «Укрзализныця» или другими перевозчиками.</p></section>
<section class="panel"><h2>Нашли ошибку?</h2>
<p>Если заметили неточность в расписании или хотите предложить новый маршрут, напишите нам: так сайт становится полезнее для всех.</p>
${FB("data", "Сообщить об ошибке")}</section>`
    },
    uk: {
      title: "Про проєкт | Колія", desc: "«Колія» — незалежний довідник залізничних маршрутів з України та в Україну: розклади, пересадки, як купити квитки.",
      h1: "Про проєкт", lead: "Незалежний довідник потягів з України та в Україну.",
      html: `<section class="panel"><h2>Що таке «Колія»</h2>
<p>«Колія» допомагає спланувати подорож потягом між Україною та країнами Європи: показує прямі потяги та варіанти з пересадкою, час у дорозі, станції пересадок і підказує, де та як купити квитки на кожну ділянку маршруту.</p>
<p>Багато маршрутів складаються з кількох потягів різних перевізників, і інформацію про них доводиться збирати на кількох сайтах. Тут її зібрано в одному місці російською, українською, англійською та польською мовами.</p></section>
<section class="panel"><h2>Звідки дані</h2>
<p>Розклади та варіанти маршрутів складено за даними перевізників: Укрзалізниця, PKP Intercity, RegioJet, České dráhy, ZSSK, MÁV, ÖBB, CFR Călători, Deutsche Bahn. Перелік джерел указано в підвалі сайту, а дату оновлення інформації показано на сторінці.</p>
<p>Розклади змінюються, тому перед поїздкою обов’язково перевіряйте актуальні дані на сайті перевізника.</p></section>
<section class="panel"><h2>Чого «Колія» не робить</h2>
<p>Ми не продаємо квитки й не приймаємо платежі. Кнопки «Як купити квитки» ведуть на офіційні сайти та застосунки перевізників. «Колія» — незалежний інформаційний проєкт, не пов’язаний з АТ «Укрзалізниця» чи іншими перевізниками.</p></section>
<section class="panel"><h2>Знайшли помилку?</h2>
<p>Якщо помітили неточність у розкладі або хочете запропонувати новий маршрут, напишіть нам: так сайт стає кориснішим для всіх.</p>
${FB("data", "Повідомити про помилку")}</section>`
    },
    en: {
      title: "About | Koliya", desc: "Koliya is an independent guide to rail routes from and to Ukraine: timetables, transfers and how to buy tickets.",
      h1: "About the project", lead: "An independent guide to trains from and to Ukraine.",
      html: `<section class="panel"><h2>What Koliya is</h2>
<p>Koliya helps you plan a train journey between Ukraine and European countries. It shows direct trains and connections with a transfer, journey times and transfer stations, and explains where and how to buy tickets for each part of the trip.</p>
<p>Many routes consist of several trains run by different carriers, so the information normally has to be collected from several websites. Here it is gathered in one place in Russian, Ukrainian, English and Polish.</p></section>
<section class="panel"><h2>Where the data comes from</h2>
<p>Timetables and route options are compiled from carriers’ information: Ukrzaliznytsia, PKP Intercity, RegioJet, České dráhy, ZSSK, MÁV, ÖBB, CFR Călători and Deutsche Bahn. The sources are listed in the footer, and the date the information was last updated is shown on the page.</p>
<p>Timetables change, so always check current information on the carrier’s website before you travel.</p></section>
<section class="panel"><h2>What Koliya does not do</h2>
<p>We do not sell tickets or take payments. The “How to buy tickets” buttons lead to the carriers’ official websites and apps. Koliya is an independent information project and is not affiliated with JSC Ukrzaliznytsia or any other carrier.</p></section>
<section class="panel"><h2>Found a mistake?</h2>
<p>If you notice an inaccuracy in a timetable or would like to suggest a new route, please write to us. It makes the site more useful for everyone.</p>
${FB("data", "Report a mistake")}</section>`
    },
    pl: {
      title: "O projekcie | Koliya", desc: "Koliya to niezależny przewodnik po trasach kolejowych z Ukrainy i na Ukrainę: rozkłady, przesiadki, jak kupić bilety.",
      h1: "O projekcie", lead: "Niezależny przewodnik po pociągach z Ukrainy i na Ukrainę.",
      html: `<section class="panel"><h2>Czym jest Koliya</h2>
<p>Koliya pomaga zaplanować podróż pociągiem między Ukrainą a krajami Europy. Pokazuje pociągi bezpośrednie i połączenia z przesiadką, czas podróży oraz stacje przesiadkowe, a także podpowiada, gdzie i jak kupić bilety na każdy odcinek trasy.</p>
<p>Wiele tras składa się z kilku pociągów różnych przewoźników, więc informacje o nich zwykle trzeba zbierać na kilku stronach. Tutaj są w jednym miejscu, po rosyjsku, ukraińsku, angielsku i polsku.</p></section>
<section class="panel"><h2>Skąd pochodzą dane</h2>
<p>Rozkłady i warianty tras opracowano na podstawie informacji przewoźników: Ukrzaliznycia, PKP Intercity, RegioJet, České dráhy, ZSSK, MÁV, ÖBB, CFR Călători i Deutsche Bahn. Źródła są wymienione w stopce, a data ostatniej aktualizacji informacji jest widoczna na stronie.</p>
<p>Rozkłady się zmieniają, dlatego przed podróżą zawsze sprawdzaj aktualne informacje na stronie przewoźnika.</p></section>
<section class="panel"><h2>Czego Koliya nie robi</h2>
<p>Nie sprzedajemy biletów i nie przyjmujemy płatności. Przyciski „Jak kupić bilety” prowadzą do oficjalnych stron i aplikacji przewoźników. Koliya to niezależny projekt informacyjny, niezwiązany z JSC Ukrzaliznycia ani z innymi przewoźnikami.</p></section>
<section class="panel"><h2>Znalazłeś błąd?</h2>
<p>Jeśli zauważysz nieścisłość w rozkładzie lub chcesz zaproponować nową trasę, napisz do nas. Dzięki temu serwis jest bardziej przydatny dla wszystkich.</p>
${FB("data", "Zgłoś błąd")}</section>`
    }
  },

  contacts: {
    ru: {
      title: "Контакты | Колія", desc: "Как связаться с проектом «Колія»: сообщить об ошибке в расписании, предложить маршрут или задать вопрос.",
      h1: "Контакты", lead: "Сообщить об ошибке, предложить маршрут или задать вопрос.",
      html: `<section class="panel"><h2>Написать нам</h2>
<p>Самый быстрый способ связаться с проектом — форма обратной связи. Выберите тему (ошибка в данных, предложение, вопрос или другое), опишите, что случилось, и при желании оставьте email или Telegram, чтобы мы могли ответить.</p>
${FB("question", "Открыть форму")}</section>
<section class="panel"><h2>Если сообщаете об ошибке</h2>
<p>Укажите номер поезда, дату и то, как должно быть. Так проверить и исправить информацию получится быстрее.</p></section>
<section class="panel"><h2>Вопросы по билетам и поездкам</h2>
<p>«Колія» не продаёт билеты и не отвечает за работу перевозчиков. По вопросам покупки, возврата и перевозки обращайтесь в службу поддержки перевозчика: телефоны Укрзалізниці указаны в подвале сайта.</p></section>`
    },
    uk: {
      title: "Контакти | Колія", desc: "Як зв’язатися з проєктом «Колія»: повідомити про помилку в розкладі, запропонувати маршрут або поставити запитання.",
      h1: "Контакти", lead: "Повідомити про помилку, запропонувати маршрут або поставити запитання.",
      html: `<section class="panel"><h2>Написати нам</h2>
<p>Найшвидший спосіб зв’язатися з проєктом — форма зворотного зв’язку. Оберіть тему (помилка в даних, пропозиція, запитання чи інше), опишіть, що сталося, і за бажанням залиште email або Telegram, щоб ми могли відповісти.</p>
${FB("question", "Відкрити форму")}</section>
<section class="panel"><h2>Якщо повідомляєте про помилку</h2>
<p>Вкажіть номер потяга, дату й те, як має бути. Так перевірити й виправити інформацію вдасться швидше.</p></section>
<section class="panel"><h2>Запитання щодо квитків і поїздок</h2>
<p>«Колія» не продає квитки й не відповідає за роботу перевізників. З питань купівлі, повернення та перевезення звертайтеся до служби підтримки перевізника: телефони Укрзалізниці вказано в підвалі сайту.</p></section>`
    },
    en: {
      title: "Contact | Koliya", desc: "How to contact Koliya: report a timetable mistake, suggest a route or ask a question.",
      h1: "Contact", lead: "Report a mistake, suggest a route or ask a question.",
      html: `<section class="panel"><h2>Write to us</h2>
<p>The quickest way to reach the project is the feedback form. Choose a topic (mistake in the data, suggestion, question or other), describe what happened and, if you like, leave an email or Telegram so we can reply.</p>
${FB("question", "Open the form")}</section>
<section class="panel"><h2>If you are reporting a mistake</h2>
<p>Please give the train number, the date and what it should say. That makes it quicker to check and fix.</p></section>
<section class="panel"><h2>Questions about tickets and journeys</h2>
<p>Koliya does not sell tickets and is not responsible for the carriers’ services. For questions about buying, refunds and carriage, contact the carrier’s customer support. The Ukrzaliznytsia phone numbers are in the footer.</p></section>`
    },
    pl: {
      title: "Kontakt | Koliya", desc: "Jak skontaktować się z Koliya: zgłosić błąd w rozkładzie, zaproponować trasę lub zadać pytanie.",
      h1: "Kontakt", lead: "Zgłoś błąd, zaproponuj trasę lub zadaj pytanie.",
      html: `<section class="panel"><h2>Napisz do nas</h2>
<p>Najszybszy sposób kontaktu z projektem to formularz. Wybierz temat (błąd w danych, propozycja, pytanie lub inne), opisz, co się stało, i jeśli chcesz, podaj e-mail lub Telegram, abyśmy mogli odpowiedzieć.</p>
${FB("question", "Otwórz formularz")}</section>
<section class="panel"><h2>Jeśli zgłaszasz błąd</h2>
<p>Podaj numer pociągu, datę i to, jak powinno być. Dzięki temu szybciej sprawdzimy i poprawimy informację.</p></section>
<section class="panel"><h2>Pytania o bilety i podróże</h2>
<p>Koliya nie sprzedaje biletów i nie odpowiada za usługi przewoźników. W sprawach zakupu, zwrotu i przewozu skontaktuj się z obsługą klienta przewoźnika. Telefony Ukrzaliznycia są w stopce.</p></section>`
    }
  },

  privacy: {
    ru: {
      title: "Политика конфиденциальности | Колія", desc: "Какие данные собирает сайт «Колія», как они используются и какие сторонние сервисы задействованы.",
      h1: "Политика конфиденциальности", lead: `Обновлено: ${UPDATED.ru}`,
      html: `<section class="panel"><h2>Кратко</h2>
<p>«Колія» — справочник, а не сервис с аккаунтами. Регистрации нет, личные данные мы специально не собираем. Данные, которые попадают к нам, — это сообщения из формы обратной связи и оценки страниц. ${G("ru").sum}</p></section>
<section class="panel"><h2>Какие данные мы получаем</h2>
<ul><li><b>Форма обратной связи.</b> Если вы отправляете сообщение, мы сохраняем его текст, выбранную тему, адрес страницы, язык и контакт (email или Telegram), если вы его указали. Мы используем это только чтобы разобраться с обращением и ответить вам. Не пишите в сообщении лишних личных данных.</li>
<li><b>Оценка «Информация помогла?».</b> Мы сохраняем оценку (да или нет), адрес страницы и язык. Без привязки к человеку.</li>
<li><b>Хранилище браузера.</b> Чтобы не просить об оценке повторно, в вашем браузере сохраняется отметка о том, что вы уже оценили страницу (localStorage). ${G("ru").ck}</li></ul></section>
<section class="panel"><h2>Сторонние сервисы</h2>
<p>Для работы сайта используются сторонние сервисы. При загрузке страниц они получают технические данные вашего запроса (например, IP-адрес и сведения о браузере) по своим правилам:</p>
<ul><li>GitHub Pages: хостинг сайта;</li><li>Supabase: база данных расписаний, а также форма обратной связи;</li><li>Google Fonts: шрифты;</li><li>flagcdn.com: изображения флагов стран.</li>${G("ru").li}</ul>
<p>Ссылки на сайты перевозчиков ведут на внешние ресурсы, на которых действуют их политики.</p></section>
<section class="panel"><h2>Реклама и статистика</h2>
<p>${G("ru").an}</p></section>
<section class="panel"><h2>Хранение и ваши права</h2>
<p>Сообщения хранятся столько, сколько нужно для обработки обращения. Вы можете попросить нас показать, исправить или удалить ваше сообщение и контакт: напишите через форму обратной связи и укажите, о каком сообщении речь. Если вы находитесь в ЕС или Великобритании, у вас также есть права, предусмотренные GDPR, включая право обратиться в орган по защите данных.</p>
<p>Мы можем обновлять эту политику. Актуальная версия всегда на этой странице, дата обновления указана вверху.</p>
${FB("other", "Написать по вопросу данных")}</section>`
    },
    uk: {
      title: "Політика конфіденційності | Колія", desc: "Які дані збирає сайт «Колія», як вони використовуються та які сторонні сервіси задіяно.",
      h1: "Політика конфіденційності", lead: `Оновлено: ${UPDATED.uk}`,
      html: `<section class="panel"><h2>Коротко</h2>
<p>«Колія» — довідник, а не сервіс з акаунтами. Реєстрації немає, особисті дані ми навмисно не збираємо. Дані, які потрапляють до нас, — це повідомлення з форми зворотного зв’язку та оцінки сторінок. ${G("uk").sum}</p></section>
<section class="panel"><h2>Які дані ми отримуємо</h2>
<ul><li><b>Форма зворотного зв’язку.</b> Якщо ви надсилаєте повідомлення, ми зберігаємо його текст, обрану тему, адресу сторінки, мову та контакт (email або Telegram), якщо ви його вказали. Ми використовуємо це лише для того, щоб розібратися зі зверненням і відповісти вам. Не пишіть у повідомленні зайвих особистих даних.</li>
<li><b>Оцінка «Інформація допомогла?».</b> Ми зберігаємо оцінку (так чи ні), адресу сторінки та мову. Без прив’язки до особи.</li>
<li><b>Сховище браузера.</b> Щоб не просити про оцінку повторно, у вашому браузері зберігається позначка про те, що ви вже оцінили сторінку (localStorage). ${G("uk").ck}</li></ul></section>
<section class="panel"><h2>Сторонні сервіси</h2>
<p>Для роботи сайту використовуються сторонні сервіси. Під час завантаження сторінок вони отримують технічні дані вашого запиту (наприклад, IP-адресу та відомості про браузер) за власними правилами:</p>
<ul><li>GitHub Pages: хостинг сайту;</li><li>Supabase: база даних розкладів, а також форма зворотного зв’язку;</li><li>Google Fonts: шрифти;</li><li>flagcdn.com: зображення прапорів країн.</li>${G("uk").li}</ul>
<p>Посилання на сайти перевізників ведуть на зовнішні ресурси, де діють їхні політики.</p></section>
<section class="panel"><h2>Реклама і статистика</h2>
<p>${G("uk").an}</p></section>
<section class="panel"><h2>Зберігання та ваші права</h2>
<p>Повідомлення зберігаються стільки, скільки потрібно для опрацювання звернення. Ви можете попросити нас показати, виправити або видалити ваше повідомлення й контакт: напишіть через форму зворотного зв’язку та вкажіть, про яке повідомлення йдеться. Якщо ви перебуваєте в ЄС або Великій Британії, ви також маєте права, передбачені GDPR, зокрема право звернутися до органу із захисту даних.</p>
<p>Ми можемо оновлювати цю політику. Актуальна версія завжди на цій сторінці, дату оновлення вказано вгорі.</p>
${FB("other", "Написати з питання даних")}</section>`
    },
    en: {
      title: "Privacy Policy | Koliya", desc: "What data the Koliya website collects, how it is used and which third-party services are involved.",
      h1: "Privacy Policy", lead: `Last updated: ${UPDATED.en}`,
      html: `<section class="panel"><h2>In short</h2>
<p>Koliya is a reference site, not a service with accounts. There is no registration and we do not set out to collect personal data. The data that reaches us is the messages sent through the feedback form and page ratings. ${G("en").sum}</p></section>
<section class="panel"><h2>What data we receive</h2>
<ul><li><b>Feedback form.</b> If you send a message, we store its text, the chosen topic, the page address, the language and your contact (email or Telegram) if you provide one. We use it only to look into your message and reply to you. Please do not include unnecessary personal data.</li>
<li><b>“Was this helpful?” rating.</b> We store the rating (yes or no), the page address and the language. It is not linked to a person.</li>
<li><b>Browser storage.</b> So that we do not ask for a rating twice, your browser keeps a flag that you have already rated a page (localStorage). ${G("en").ck}</li></ul></section>
<section class="panel"><h2>Third-party services</h2>
<p>The site relies on third-party services. When pages load, they receive technical data about your request (for example your IP address and browser details) under their own policies:</p>
<ul><li>GitHub Pages: hosting of the site;</li><li>Supabase: the timetable database and the feedback form;</li><li>Google Fonts: fonts;</li><li>flagcdn.com: country flag images.</li>${G("en").li}</ul>
<p>Links to carriers’ websites lead to external resources that have their own policies.</p></section>
<section class="panel"><h2>Advertising and analytics</h2>
<p>${G("en").an}</p></section>
<section class="panel"><h2>Retention and your rights</h2>
<p>Messages are kept for as long as needed to handle the request. You can ask us to show, correct or delete your message and contact: write through the feedback form and say which message you mean. If you are in the EU or the UK, you also have the rights provided by the GDPR, including the right to complain to a data protection authority.</p>
<p>We may update this policy. The current version is always on this page, with the date of the last update at the top.</p>
${FB("other", "Write about my data")}</section>`
    },
    pl: {
      title: "Polityka prywatności | Koliya", desc: "Jakie dane zbiera serwis Koliya, jak są wykorzystywane i z jakich usług zewnętrznych korzysta.",
      h1: "Polityka prywatności", lead: `Ostatnia aktualizacja: ${UPDATED.pl}`,
      html: `<section class="panel"><h2>W skrócie</h2>
<p>Koliya to serwis informacyjny, a nie usługa z kontami. Nie ma rejestracji i nie zbieramy świadomie danych osobowych. Dane, które do nas trafiają, to wiadomości z formularza kontaktowego i oceny stron. ${G("pl").sum}</p></section>
<section class="panel"><h2>Jakie dane otrzymujemy</h2>
<ul><li><b>Formularz kontaktowy.</b> Jeśli wyślesz wiadomość, zapisujemy jej treść, wybrany temat, adres strony, język oraz kontakt (e-mail lub Telegram), jeśli go podasz. Wykorzystujemy to wyłącznie, aby zająć się zgłoszeniem i odpowiedzieć. Nie podawaj w wiadomości zbędnych danych osobowych.</li>
<li><b>Ocena „Czy informacja pomogła?”.</b> Zapisujemy ocenę (tak lub nie), adres strony i język. Nie jest powiązana z osobą.</li>
<li><b>Pamięć przeglądarki.</b> Aby nie prosić o ocenę ponownie, w przeglądarce zapisywany jest znacznik, że strona została już oceniona (localStorage). ${G("pl").ck}</li></ul></section>
<section class="panel"><h2>Usługi zewnętrzne</h2>
<p>Serwis korzysta z usług zewnętrznych. Podczas ładowania stron otrzymują one dane techniczne Twojego żądania (np. adres IP i informacje o przeglądarce) zgodnie z własnymi zasadami:</p>
<ul><li>GitHub Pages: hosting serwisu;</li><li>Supabase: baza danych rozkładów oraz formularz kontaktowy;</li><li>Google Fonts: czcionki;</li><li>flagcdn.com: obrazy flag państw.</li>${G("pl").li}</ul>
<p>Linki do stron przewoźników prowadzą do zasobów zewnętrznych, które mają własne polityki.</p></section>
<section class="panel"><h2>Reklamy i statystyki</h2>
<p>${G("pl").an}</p></section>
<section class="panel"><h2>Przechowywanie i Twoje prawa</h2>
<p>Wiadomości są przechowywane tak długo, jak potrzeba do obsługi zgłoszenia. Możesz poprosić o wgląd, poprawienie lub usunięcie swojej wiadomości i kontaktu: napisz przez formularz i wskaż, o którą wiadomość chodzi. Jeśli przebywasz w UE lub w Wielkiej Brytanii, przysługują Ci także prawa wynikające z RODO, w tym prawo wniesienia skargi do organu ochrony danych.</p>
<p>Możemy aktualizować tę politykę. Aktualna wersja jest zawsze na tej stronie, a data ostatniej zmiany widnieje na górze.</p>
${FB("other", "Napisz w sprawie danych")}</section>`
    }
  }
};
/* подписи ссылок в подвале */
const FOOTLINKS = {
  privacy: {ru: "Конфиденциальность", uk: "Конфіденційність", en: "Privacy", pl: "Prywatność"},
  about: {ru: "О проекте", uk: "Про проєкт", en: "About", pl: "O projekcie"},
  contacts: {ru: "Контакты", uk: "Контакти", en: "Contact", pl: "Kontakt"}
};
/* страница 404 (GitHub Pages отдаёт корневой 404.html для любого несуществующего адреса, язык берётся из префикса /uk/ /en/ /pl/) */
const NF = {
  ru: {title: "Страница не найдена | Колія", desc: "Такой страницы нет. Вернитесь на главную и выберите маршрут.", h1: "Страница не найдена", lead: "Ошибка 404: такого адреса на сайте нет.",
    h2: "Куда дальше?", p: "Возможно, ссылка устарела или в адресе опечатка. Начните с главной: там все направления и маршруты поездов из Украины и в Украину.", home: "На главную", fb: "Сообщить о битой ссылке"},
  uk: {title: "Сторінку не знайдено | Колія", desc: "Такої сторінки немає. Поверніться на головну й оберіть маршрут.", h1: "Сторінку не знайдено", lead: "Помилка 404: такої адреси на сайті немає.",
    h2: "Куди далі?", p: "Можливо, посилання застаріло або в адресі є помилка. Почніть з головної: там усі напрямки та маршрути потягів з України та в Україну.", home: "На головну", fb: "Повідомити про зламане посилання"},
  en: {title: "Page not found | Koliya", desc: "This page does not exist. Go back to the home page and choose a route.", h1: "Page not found", lead: "Error 404: there is no such address on this site.",
    h2: "Where to next?", p: "The link may be outdated or the address may contain a typo. Start from the home page: it lists all directions and train routes from and to Ukraine.", home: "Go to home page", fb: "Report a broken link"},
  pl: {title: "Nie znaleziono strony | Koliya", desc: "Takiej strony nie ma. Wróć na stronę główną i wybierz trasę.", h1: "Nie znaleziono strony", lead: "Błąd 404: takiego adresu nie ma w serwisie.",
    h2: "Co dalej?", p: "Link mógł się zdezaktualizować albo w adresie jest literówka. Zacznij od strony głównej: znajdziesz tam wszystkie kierunki i trasy pociągów z Ukrainy i do Ukrainy.", home: "Na stronę główną", fb: "Zgłoś zepsuty link"}
};
module.exports = {P, FOOTLINKS, NF};

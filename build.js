/* Сборка языковых версий: node build.js (обычно через node sync.js, который сначала обновляет данные из базы)
   route.src.html + переводы из базы → kyiv-warsaw.html, warsaw-kyiv.html (ru, в корне) и uk/ en/ pl/ + sitemap.xml + dict/<язык>.js
   Переводы правятся в админке (вкладки «Тексты», «Станции», «Направления»); готовые .html руками не править.
   Данные из базы лежат в снимках i18n.db.json (тексты интерфейса, станции) и routes.db.json (направления и их тексты). */
const fs = require("fs");
const SITE = "https://koliya.org/", LANGS = ["ru", "uk", "en", "pl"];
/* переводы: I.ru/uk/en/pl — тексты интерфейса, I.ST — станции [uk, en, pl, «в…» ru, «у…» uk, «w…» pl], I.CN — страны. Собираются из снимка базы */
const I = (() => {
  let db; try { db = JSON.parse(fs.readFileSync("i18n.db.json", "utf8")) } catch (e) { throw new Error("build.js: нет i18n.db.json. Выполните node sync.js (или i18n.sql в Supabase, потом node sync.js).") }
  const I = {ST: {}, CN: {}};
  for (const l of LANGS) I[l] = {};
  for (const r of db.ui || []) {
    const c = r.key.match(/^cn\.([a-z]{2})(\.gen)?$/);
    for (const l of LANGS) {
      if (!r[l]) continue; /* пустой перевод: сайт покажет русский текст */
      if (c) { if (l === "ru") continue; const o = (I.CN[c[1]] = I.CN[c[1]] || {}); (o[l] = o[l] || [])[c[2] ? 1 : 0] = r[l] }
      else I[l][r.key] = r[l]
    }
  }
  for (const s of db.stations || []) {
    const a = [s.name_uk || "", s.name_en || "", s.name_pl || "", s.in_ru || "", s.in_uk || "", s.in_pl || "", s.short_ru || "", s.short_uk || "", s.short_en || "", s.short_pl || ""]; /* [6..9] — короткие названия для карточек */
    for (const n of [s.name_ru].concat(s.aliases || [])) if (!(n in I.ST)) I.ST[n] = a
  }
  I.META = db.meta || {};
  return I
})();
/* тексты формы обратной связи (common.js) по умолчанию; если ключ fb.* есть в ui_texts (админка → «Тексты»), берётся значение из базы */
const FB_DEF = {
  "fb.link": {ru: "Обратная связь", uk: "Зворотний зв’язок", en: "Feedback", pl: "Kontakt"},
  "fb.report": {ru: "Нашли неточность?", uk: "Знайшли неточність?", en: "Found a mistake?", pl: "Znalazłeś błąd?"},
  "fb.title": {ru: "Обратная связь", uk: "Зворотний зв’язок", en: "Feedback", pl: "Kontakt"},
  "fb.kind": {ru: "Тема", uk: "Тема", en: "Topic", pl: "Temat"},
  "fb.k.data": {ru: "Ошибка в данных", uk: "Помилка в даних", en: "Mistake in the data", pl: "Błąd w danych"},
  "fb.k.idea": {ru: "Предложение", uk: "Пропозиція", en: "Suggestion", pl: "Propozycja"},
  "fb.k.question": {ru: "Вопрос", uk: "Запитання", en: "Question", pl: "Pytanie"},
  "fb.k.other": {ru: "Другое", uk: "Інше", en: "Other", pl: "Inne"},
  "fb.msg": {ru: "Сообщение", uk: "Повідомлення", en: "Message", pl: "Wiadomość"},
  "fb.msg.ph": {ru: "Что не так или что улучшить? Если это ошибка, укажите поезд, дату и как должно быть.", uk: "Що не так або що покращити? Якщо це помилка, вкажіть потяг, дату і як має бути.", en: "What is wrong or what could be better? For a mistake, please give the train, the date and what it should say.", pl: "Co jest nie tak lub co poprawić? W razie błędu podaj pociąg, datę i jak powinno być."},
  "fb.contact": {ru: "Как вам ответить (необязательно)", uk: "Як вам відповісти (необов’язково)", en: "How can we reply (optional)", pl: "Jak możemy odpowiedzieć (opcjonalnie)"},
  "fb.contact.ph": {ru: "Email или Telegram", uk: "Email або Telegram", en: "Email or Telegram", pl: "E-mail lub Telegram"},
  "fb.privacy": {ru: "Мы сохраним сообщение, адрес страницы и контакт (если вы его укажете), только чтобы разобраться с обращением и ответить вам. Не пишите лишних личных данных.", uk: "Ми збережемо повідомлення, адресу сторінки та контакт (якщо ви його вкажете) лише для того, щоб розібратися із зверненням і відповісти вам. Не пишіть зайвих особистих даних.", en: "We store your message, the page address and your contact (if you give one) only to look into the report and reply to you. Please do not include unnecessary personal data.", pl: "Zapisujemy wiadomość, adres strony i kontakt (jeśli go podasz) wyłącznie po to, aby zająć się zgłoszeniem i odpowiedzieć. Nie podawaj zbędnych danych osobowych."},
  "fb.send": {ru: "Отправить", uk: "Надіслати", en: "Send", pl: "Wyślij"},
  "fb.cancel": {ru: "Закрыть", uk: "Закрити", en: "Close", pl: "Zamknij"},
  "fb.thanks": {ru: "Спасибо! Сообщение отправлено.", uk: "Дякуємо! Повідомлення надіслано.", en: "Thank you! Your message has been sent.", pl: "Dziękujemy! Wiadomość została wysłana."},
  "fb.err": {ru: "Не удалось отправить. Попробуйте ещё раз позже.", uk: "Не вдалося надіслати. Спробуйте ще раз пізніше.", en: "Could not send. Please try again later.", pl: "Nie udało się wysłać. Spróbuj ponownie później."},
  "fb.short": {ru: "Напишите хотя бы несколько слов (от 5 символов).", uk: "Напишіть хоча б кілька слів (від 5 символів).", en: "Please write a few words (at least 5 characters).", pl: "Napisz kilka słów (co najmniej 5 znaków)."},
  "fb.rate": {ru: "Информация помогла?", uk: "Інформація допомогла?", en: "Was this helpful?", pl: "Czy informacja pomogła?"},
  "fb.yes": {ru: "Да", uk: "Так", en: "Yes", pl: "Tak"},
  "fb.no": {ru: "Нет", uk: "Ні", en: "No", pl: "Nie"},
  "fb.down.h": {ru: "Что не так?", uk: "Що не так?", en: "What is wrong?", pl: "Co jest nie tak?"},
  "fb.down.ph": {ru: "Необязательно: что помогло бы лучше?", uk: "Необов’язково: що допомогло б краще?", en: "Optional: what would help more?", pl: "Opcjonalnie: co pomogłoby bardziej?"},
  "fb.rate.thanks": {ru: "Спасибо за оценку!", uk: "Дякуємо за оцінку!", en: "Thanks for your feedback!", pl: "Dziękujemy za ocenę!"},
  "fb.wait": {ru: "Подождите несколько секунд перед повторной отправкой.", uk: "Зачекайте кілька секунд перед повторним надсиланням.", en: "Please wait a few seconds before sending again.", pl: "Poczekaj kilka sekund przed ponownym wysłaniem."}
};
for (const k in FB_DEF) for (const l of LANGS) if (!I[l][k]) I[l][k] = FB_DEF[k][l];
/* подпись к источникам данных в подвале; если ключ есть в ui_texts (админка → «Тексты»), берётся значение из базы */
const SP = require("./static-pages.js"); /* служебные страницы: privacy, about, contacts (тексты в static-pages.js) */
const FOOT_DEF = {"f.src": {ru: "Источники данных о поездах:", uk: "Джерела даних про поїзди:", en: "Train data sources:", pl: "Źródła danych o pociągach:"}};
for (const k in SP.FOOTLINKS) FOOT_DEF["f." + k] = SP.FOOTLINKS[k];
for (const k in FOOT_DEF) for (const l of LANGS) if (!I[l][k]) I[l][k] = FOOT_DEF[k][l];
/* что нужно браузеру: тексты интерфейса и станции (без текстов страниц маршрутов) */
const CLIENT = JSON.parse(JSON.stringify(I));
/* тексты блока «Ещё маршруты» по умолчанию; если ключ есть в ui_texts (админка → «Тексты»), берётся значение из базы */
const MORE_DEF = {
  "more.rev": {ru: "Обратное направление", uk: "Зворотний напрямок", en: "Return route", pl: "Trasa powrotna"},
  "more.from": {ru: "Другие направления из города %s", uk: "Інші напрямки з міста %s", en: "More routes from %s", pl: "Inne trasy z miasta %s"},
  "more.to": {ru: "Другие маршруты в город %s", uk: "Інші маршрути до міста %s", en: "More routes to %s", pl: "Inne trasy do miasta %s"},
  "more.dir": {ru: "Все маршруты этого направления", uk: "Усі маршрути цього напрямку", en: "All routes in this direction", pl: "Wszystkie trasy w tym kierunku"}
};
for (const k in MORE_DEF) for (const l of LANGS) if (!I[l][k]) I[l][k] = MORE_DEF[k][l];
/* нет перевода — подставляется русский текст */
for (const l of LANGS.slice(1)) { const miss = Object.keys(I.ru).filter(k => !I[l][k]); for (const k of miss) I[l][k] = I.ru[k]; if (miss.length) console.warn("ВНИМАНИЕ: " + l + ": нет перевода для " + miss.length + " ключей (показан русский): " + miss.slice(0, 8).join(", ") + (miss.length > 8 ? "…" : "")) }
/* Список страниц маршрутов живёт только в базе (таблица route_pages, админка → «Направления»): sync.js сохраняет его в routes.db.json. */
const ROUTES = [];
/* Страницы берутся из routes.db.json (снимок таблицы route_pages, его делает node sync.js). Поле kind: custom — все параметры страницы лежат в extra;
   slice — прямые поезда из других вариантов (как Киев → Хелм); direct — прямые поезда, варианты вносятся вручную; transfer — с пересадкой на станции x.
   extra переопределяет любые поля; active: false убирает страницу из сборки. texts — тексты страницы по языкам {ru: {title, desc, h1, lead, all, more, leadm}, ...}.
   names — переводы городов, если их нет в словаре станций. */
const DBR = (() => { try { return JSON.parse(fs.readFileSync("routes.db.json", "utf8")) } catch (e) { return [] } })();
/* тексты страниц лежат в route_pages.texts; кладём их в словари под ключами <id>.title, <id>.lead… (на них ссылаются и страницы вида «Киев → Хелм» через like) */
for (const p of DBR) for (const l of LANGS) for (const [k, v] of Object.entries((p.texts || {})[l] || {})) if (v) I[l][p.id + "." + k] = v;
for (const p of DBR) {
  const k = ROUTES.findIndex(x => x.id === p.id);
  if (p.active === false) { if (k >= 0) ROUTES.splice(k, 1); continue }
  const out = /^ua-/.test(p.route), r = {id: p.id, file: p.file, FROM: p.from_name, TO: p.to_name, BACK: p.back, hash: p.route, rev: p.rev};
  if (p.kind !== "custom") {
    Object.assign(r, {like: p.like_id || (out ? "kw" : "wk"), autotxt: true});
    if (p.kind === "slice") Object.assign(r, {coach: false, slice: true});
    else if (p.kind === "direct") Object.assign(r, {coach: false});
    else {
      Object.assign(r, {x: p.x || "Хелм", direct: false, xtxt: true});
      if (p.border) r.border = p.border
    }
  }
  Object.assign(r, p.extra || {});
  r.buy = p.buy || null; /* блок «Как купить билеты» (см. buyHtml) */
  if (p.texts && Object.keys(p.texts).length) r.texts = p.texts;
  if (k >= 0) ROUTES[k] = r; else ROUTES.push(r);
  for (const [n, t] of Object.entries(p.names || {})) if (!I.ST[n]) I.ST[n] = [t.uk || "", t.en || "", t.pl || ""]
}

/* проверка: повторы в ROUTES */
{
  const seen = {};
  for (const r of ROUTES) for (const k of ["id", "file"]) { if (seen[k + r[k]]) throw new Error("build.js: в ROUTES повтор " + k + " = " + r[k] + ". Оставьте одну запись."); seen[k + r[k]] = 1 }
}
const tpl0 = fs.readFileSync("route.src.html", "utf8");
const VIA = {ru: "через", uk: "через", en: "via", pl: "przez"};
/* «в Хелме» / «in Chełm»: из словаря станций; нет формы — «через Название» */
const xin = (n, l) => { const s = I.ST[n], i = {ru: 3, uk: 4, pl: 5}[l]; return l === "en" ? "in " + st(n, l) : s && s[i] ? s[i] : VIA[l] + " " + st(n, l) };
const st = (n, l) => { const s = I.ST[n], i = {uk: 0, en: 1, pl: 2}[l]; return s && i != null && s[i] ? s[i] : n };
/* короткое название для компактных ссылок (главная): short_uk / short_en / short_pl из таблицы станций; нет короткого — обычное название; ru остаётся как есть */
/* короткое название для H1 шапки страницы: без «Главный», «Центральный» и т. п. (как в карточках); нет короткого — обычное */
const stH1 = (n, l) => { const s = I.ST[n], i = {ru: 6, uk: 7, en: 8, pl: 9}[l]; return s && s[i] ? s[i] : st(n, l) };
/* «в Хелме» без «Главный» для en: станция пересадки страницы (route_pages.x) для автотекстов */
const xinS = (n, l) => l === "en" ? "in " + stH1(n, l) : xin(n, l);
const xAll = (r, l) => r.x ? xinS(r.x, l) : "";
const stShort = (n, l) => { const s = I.ST[n], i = {uk: 7, en: 8, pl: 9}[l]; return s && i != null && s[i] ? s[i] : st(n, l) };
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => k in v ? v[k] : m);
const path = (l, f) => (l === "ru" ? "" : l + "/") + f;
/* версия для ?v= считается от содержимого style.css и common.js: пока они не менялись, страницы при пересборке не меняются */
const OGL = {ru: "ru_RU", uk: "uk_UA", en: "en_US", pl: "pl_PL"};
const VER = require("crypto").createHash("md5").update(fs.readFileSync(__dirname + "/style.css")).update(fs.readFileSync(__dirname + "/common.js")).update(fs.readFileSync(__dirname + "/consent.js")).digest("hex").slice(0, 8), urls = [SITE], SM = []; /* SM: страницы для sitemap.xml: {loc, alts: [[язык, адрес]], body} */
/* тексты страниц slice-маршрутов (Киев → Хелм и т.п.) собираются здесь, отдельно вносить их в админке не нужно */
const SLICE_TXT = {
  ru: (a, b) => ({title: `${a} → ${b} поездом | Колія`, desc: `Поезда ${a} — ${b} без пересадок: время, станции, длительность.`, h1: `Поездом: ${a} → ${b}`, lead: `Расписание поездов ${a} — ${b}: прямые поезда без пересадок. Время в пути, остановки и информация о покупке билетов.`}),
  uk: (a, b) => ({title: `${a} → ${b} потягом | Колія`, desc: `Поїзди ${a} — ${b} без пересадок: час, станції, тривалість.`, h1: `Потягом: ${a} → ${b}`, lead: `Розклад поїздів ${a} — ${b}: прямі поїзди без пересадок. Час у дорозі, зупинки та інформація про купівлю квитків.`}),
  en: (a, b) => ({title: `${a} → ${b} by train | Koliya`, desc: `Trains ${a} — ${b}, no transfers: times, stations, duration.`, h1: `By train: ${a} → ${b}`, lead: `Train timetable ${a} — ${b}: direct trains with no transfers. Journey time, stops and ticket information.`}),
  pl: (a, b) => ({title: `${a} → ${b} pociągiem | Koliya`, desc: `Pociągi ${a} — ${b} bez przesiadek: godziny, stacje, czas podróży.`, h1: `Pociągiem: ${a} → ${b}`, lead: `Rozkład pociągów ${a} — ${b}: pociągi bezpośrednie bez przesiadek. Czas podróży, postoje i informacje o zakupie biletów.`})
};
/* тексты страниц с пересадкой, добавленных в админке (x — «в Хелме» / «in Chełm» из словаря станций) */
const TRANSFER_TXT = {
  ru: (a, b, x) => ({title: `${a} → ${b} поездом | Колія`, desc: `Поезда ${a} — ${b} с пересадкой ${x}: время, станции, длительность.`, h1: `Поездом: ${a} → ${b}`, lead: `Расписание поездов ${a} — ${b}: варианты с пересадкой ${x}. Время в пути, остановки и информация о покупке билетов.`}),
  uk: (a, b, x) => ({title: `${a} → ${b} потягом | Колія`, desc: `Поїзди ${a} — ${b} з пересадкою ${x}: час, станції, тривалість.`, h1: `Потягом: ${a} → ${b}`, lead: `Розклад поїздів ${a} — ${b}: варіанти з пересадкою ${x}. Час у дорозі, зупинки та інформація про купівлю квитків.`}),
  en: (a, b, x) => ({title: `${a} → ${b} by train | Koliya`, desc: `Trains ${a} — ${b} with a change ${x}: times, stations, duration.`, h1: `By train: ${a} → ${b}`, lead: `Train timetable ${a} — ${b}: connections with a change ${x}. Journey time, stops and ticket information.`}),
  pl: (a, b, x) => ({title: `${a} → ${b} pociągiem | Koliya`, desc: `Pociągi ${a} — ${b} z przesiadką ${x}: godziny, stacje, czas podróży.`, h1: `Pociągiem: ${a} → ${b}`, lead: `Rozkład pociągów ${a} — ${b}: połączenia z przesiadką ${x}. Czas podróży, postoje i informacje o zakupie biletów.`})
};
const CTRY = (() => {
  let db; try { db = JSON.parse(fs.readFileSync("i18n.db.json", "utf8")) } catch (e) { db = {} }
  if (!(db.countries || []).length) throw new Error("build.js: в i18n.db.json нет списка стран. Выполните node sync.js");
  const f = {};
  for (const r of db.ui || []) { const m = r.key.match(/^cn\.([a-z]{2})(\.gen)?$/); if (m && r.ru) (f[m[1]] = f[m[1]] || {})[m[2] ? "gen" : "acc"] = r.ru }
  return db.countries.slice().sort((x, y) => x.sort - y.sort || x.slug.localeCompare(y.slug)).map(c => {
    const o = f[c.slug] || {};
    if (!o.acc || !o.gen) console.warn("ВНИМАНИЕ: у страны " + c.slug + " нет русских форм «в …» / «из …» (вкладка «Страны» в админке): на главной будет название в именительном падеже");
    return [c.slug, c.name, o.acc || c.name, o.gen || c.name, c.flag || ""]
  })
})();
/* «Все маршруты: Украина — Чехия» для страницы без своего текста: страны берутся из кода направления (ua-cz / cz-ua), а не копируются из похожей страницы (там всегда Польша) */
const allTxt = (r, l) => { const m = String(r.hash).match(/^ua-([a-z]{2})$|^([a-z]{2})-ua$/); if (!m) return ""; const c = m[1] || m[2], UA = {ru: "Украина", uk: "Україна", en: "Ukraine", pl: "Ukraina"}[l], CC = l === "ru" ? (CTRY.find(z => z[0] === c) || [])[1] : ((I.CN[c] || {})[l] || [])[0]; return CC ? {ru: "Все маршруты: ", uk: "Усі маршрути: ", en: "All routes: ", pl: "Wszystkie trasy: "}[l] + (m[1] ? UA + " — " + CC : CC + " — " + UA) : "" };
/* подвал: источники данных (название, сайт) и дата обновления информации. Дата — последнее изменение вариантов в базе (sync.js кладёт её в i18n.db.json → meta.updated), иначе дата сборки; в браузере common.js уточняет её по базе */
const FOOT_SRC = [["Укрзалізниця", "https://uz.gov.ua/"], ["PKP Intercity", "https://intercity.pl/"], ["RegioJet", "https://regiojet.cz/"], ["České dráhy", "https://www.cd.cz/"], ["ZSSK", "https://www.zssk.sk/"], ["MÁV", "https://jegy.mav.hu/"], ["ÖBB", "https://www.oebb.at/"], ["CFR Călători", "https://www.cfrcalatori.ro/"], ["Deutsche Bahn", "https://www.bahn.de/"]];
const fmtDate = x => new Intl.DateTimeFormat("ru-RU", {day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Kyiv"}).format(x);
const footDate = (txt, date) => /\{date\}/.test(txt) ? txt.replace(/\{date\}/g, `<time class="fdate">${date}</time>`) : txt.replace(/\d{1,2}\.\d{1,2}\.\d{4}/, `<time class="fdate">${date}</time>`);
const footerHtml = (d, l) => `<div class="fcols">\n<div><b>🚆 Колія</b><p>${d.f1}</p></div>\n<div><b>${d.f2h}</b>\n<p>${d.f2a}</p>\n<p>${footDate(d.f2b, fmtDate(I.META.updated ? new Date(I.META.updated) : new Date()))}</p>\n<p>${d.f2c}</p></div>\n<div><b>${d.f3h}</b><p>${d.f3}</p></div></div>\n<div class="fbar"><div class="fsrc"><span class="fsl">${d["f.src"]}</span><ul class="fchips">${FOOT_SRC.map(x => `<li><a href="${x[1]}" target="_blank" rel="noopener">${x[0]}</a></li>`).join("")}</ul></div>\n<div class="flow"><span>© ${new Date().getFullYear()} Колія</span><nav class="flinks">${["about", "contacts", "privacy"].map(k => `<a href="${k}.html">${d["f." + k]}</a>`).join("")}</nav><button type="button" class="fb-link" data-fb="other">${d["fb.link"]}</button></div></div>`;
/* Блок «Как купить билеты»: route_pages.buy = {note: {ru, uk, en, pl}, blocks: [{direct, h: {…}, steps: [{…}, …], btns: [{pri, url, t: {…}}]}]}.
   Тексты вносятся вручную в админке (вкладка «Направления» → «Как купить билеты»); блоки выводятся в заданном порядке.
   Нет перевода — показывается русский текст и выводится предупреждение. */
const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const NOTR = []; /* страницы, где в блоке покупки не хватает переводов: [файл, язык, сколько текстов] */
const buyHtml = (r, l, d) => {
  const B = r.buy, blocks = B && Array.isArray(B.blocks) ? B.blocks : [];
  if (!blocks.length) return "";
  let miss = 0;
  const T = o => { const t = o && typeof o === "object" ? o[l] : ""; if (t) return esc(t); if (l !== "ru") miss++; return esc(o && o.ru) }; /* нет перевода — русский */
  const n = blocks.length, html = `<section class="panel" id="buy"><h2>${d["buy.h"]}</h2>\n<div class="buy${n === 1 ? " one" : n === 2 ? " two" : n === 3 ? " three" : ""}">\n` + blocks.map(b =>
    `<div${b.direct ? ' class="d"' : ""}><h3>${T(b.h)}</h3><ol class="steps">\n${(b.steps || []).map(s => `<li>${T(s)}</li>`).join("\n")}</ol>\n${(b.btns || []).map(x => `<a class="btn${x.pri ? " pri" : ""}" href="${esc(x.url)}" target="_blank" rel="noopener">${T(x.t)}</a>`).join("\n")}</div>`).join("\n")
    + `\n</div>` + (B.note && B.note.ru ? `\n<p class="buy-note">${T(B.note)}</p>` : "") + `</section>`;
  if (miss) NOTR.push([r.file, l, miss]);
  return html
};
const PEND = []; /* страницы, в которые карточки вставляются вторым проходом (после dict/*.js и pages.js) */
for (const r of ROUTES) for (const l of LANGS) {
  const d = I[l], pre = l === "ru" ? "" : "../";
  const v = {ver: VER, lang: l, base: pre, home: "./", FROM: r.FROM, TO: r.TO, BACK: r.BACK, hash: r.hash, rev: r.rev,
    chipRev: stH1(r.TO, l) + " → " + stH1(r.FROM, l), canon: SITE + path(l, r.file)};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, r.file)}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE + r.file}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, r.file)}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  if (r.slice || r.autotxt) { const tx = (r.xtxt ? TRANSFER_TXT : SLICE_TXT)[l](stH1(r.FROM, l), stH1(r.TO, l), xAll(r, l)); for (const k in tx) if (!d[r.id + "." + k]) d[r.id + "." + k] = tx[k]; for (const k of ["all", "more"]) if (!d[r.id + "." + k]) d[r.id + "." + k] = k === "all" && allTxt(r, l) || d[r.like + "." + k] }
  for (const k of ["title", "desc", "h1", "lead", "all", "more"]) v["r_" + k] = fill(d[r.id + "." + k], v);
  const X = r.x || "Хелм", direct = r.direct !== false; /* direct: false — на странице нет прямого поезда, все варианты идут как «с пересадкой» */
  v.stamp = "v" + VER + " direct=" + direct + " x=" + X;
  v.border = r.border ? fill(d["border." + r.border], v) : ""; v.hasDirect = String(direct); v.slice = String(!!r.slice);
  v.ogimg = SITE + "og-image.jpg"; v.ogloc = OGL[l]; v.ogalt = LANGS.filter(x => x !== l).map(x => `    <meta property="og:locale:alternate" content="${OGL[x]}">`).join("\n");
  v.jsonld = JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    {"@type": "ListItem", position: 1, name: "Колія", item: SITE + path(l, "")}, {"@type": "ListItem", position: 2, name: v.r_h1, item: SITE + path(l, r.file)}]}).replace(/</g, "\\u003c");
  v.buyhtml = buyHtml(r, l, d); v.hasbuy = String(!!v.buyhtml);
  v.hide = JSON.stringify(Array.isArray(r.hide) ? r.hide.map(String) : []); /* hide: номера поездов, скрытых на странице «из вариантов других направлений» (правится в админке) */
  /* split: станции пересадки, на которых вариант получает пометку «пограничный контроль» (если у страницы задан border; сейчас это Перемышль) */
  v.split = JSON.stringify((r.split || []).map(n => [n, r.border && n === "Перемышль" ? 1 : 0])); v["transfer.hx"] = fill(d["transfer.h3"], v); /* нейтральный заголовок «С пересадкой» — только если на странице есть прямой поезд */
  v.leadx = r.leadx || ""; v.leadm = JSON.stringify(r.leadx && d[r.id + ".leadm"] ? fill(d[r.id + ".leadm"], v) : ""); /* leadx: станция; если на странице есть пересадка на ней, подзаголовок заменяется на <id>.leadm */
  v.cards = JSON.stringify({FROM: r.FROM, TO: r.TO, SLICE: !!r.slice, HIDE: Array.isArray(r.hide) ? r.hide.map(String) : [], SPLIT: JSON.parse(v.split), HAS_DIRECT: direct, HAS_BUY: !!v.buyhtml,
    dh: fill(d["direct.h"], v), ds: fill(d["direct.s"], v), th: v["transfer.hx"], noH: fill(d["noopts.h"], v), noP: fill(d["noopts.p"], v), howq: fill(d["d.howq"], v), hows: fill(d["d.hows"], v), how: fill(d["d.how"], v)}).replace(/</g, "\\u003c");
  const tpl1 = direct ? tpl0 : tpl0.replace(/\/\*D\*\/[\s\S]*?\/\*\/D\*\//g, ""),
    tpl2 = r.border ? tpl1 : tpl1.replace(/\/\*B\*\/[\s\S]*?\/\*\/B\*\//g, ""),
    tplC = r.coach === false ? tpl2.replace(/\/\*C\*\/[\s\S]*?\/\*\/C\*\//g, "") : tpl2; /* coach: false — без описания купе в карточках прямого поезда */
  const out = tplC.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, r.file), out);
  urls.push(SITE + path(l, r.file)); const sme = {loc: SITE + path(l, r.file), alts: LANGS.map(x => [x, SITE + path(x, r.file)]), body: out}; SM.push(sme); PEND.push({file: path(l, r.file), l, C: JSON.parse(v.cards), sme});
  if (l === "ru") console.log("  " + r.file + ": " + (direct ? "есть прямой поезд" : "БЕЗ прямого поезда") + ", пересадка: " + X);
}
for (const [f, l, n] of NOTR) console.warn("ВНИМАНИЕ: " + f + " (" + l + "): в блоке «Как купить билеты» нет перевода для " + n + " текстов (показан русский)");
/* главная: страны, популярные маршруты, полезные ссылки и подвал собираются здесь в статический HTML (без запросов к базе и без JS); скрипт на странице отвечает только за интерактив и страницы направлений по #хэшу */
const hx = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const CFG = new Function("window", fs.readFileSync("config.js", "utf8") + "\n;return window.CFG")({});
const PGS = CFG.pagesFromRows(DBR); /* порядок — по полю sort, как в базе (sync.js забирает записи уже отсортированными) */
/* pages.js: данные из базы для браузера: список страниц (главная, блок «Другие направления») и пометки поездов (trains.badge: seat / odd / even → номера поездов) */
const BADGES = {};
for (const t of (() => { try { return JSON.parse(fs.readFileSync("i18n.db.json", "utf8")).trains || [] } catch (e) { return [] } })()) (BADGES[t.badge] = BADGES[t.badge] || []).push(t.number);
fs.writeFileSync("pages.js", "/* создаётся сборкой (node sync.js) из базы, руками не править */\nwindow.CFG.PAGES = " + JSON.stringify(PGS) + ";\nwindow.CFG.TRAIN_BADGES = " + JSON.stringify(BADGES) + ";\n");
/* страны: [код, название, «в …» (вин.), «из …» (род.), флаг-эмодзи]; порядок — как на главной (поле sort).
   Список и флаги — таблица countries, русские формы — ui_texts (cn.<код>, cn.<код>.gen, колонка ru); для uk/en/pl названия берутся из I.CN. Правятся во вкладке «Страны» админки. */

/* ссылки блока «Полезная информация» на главной: телефоны, где купить билет, аэропорты — таблица home_links (вкладка «Главная» в админке) */
const HL = (() => {
  let db; try { db = JSON.parse(fs.readFileSync("i18n.db.json", "utf8")) } catch (e) { db = {} }
  if (!Array.isArray(db.home_links)) throw new Error("build.js: в i18n.db.json нет ссылок главной (home_links). Выполните node sync.js");
  return db.home_links
})();
const hlist = k => HL.filter(x => x.kind === k).sort((x, y) => x.sort - y.sort);
const hlab = (x, l) => x["label_" + l] || x.label_ru;
const ctryOf = p => p.route.replace(/^ua-|-ua$/, "");
/* страницы, которые показываются на главной сразу, — отмечены галочкой «на главной» во вкладке «Направления» (route_pages.popular);
   остальные маршруты страны лежат в раскрывающемся списке (в HTML они есть). Если у страны нет ни одной отмеченной страницы, показываются все её маршруты. */
const POP = {};
for (const p of DBR) if (p.popular && p.active !== false) (POP[ctryOf(p)] = POP[ctryOf(p)] || []).push(p.file);
for (const p of PGS) { /* проверки: ссылки главной ведут только на существующие страницы и страны */
  if (!CTRY.some(c => c[0] === ctryOf(p))) throw new Error("build.js: страница " + p.href + " (route " + p.route + ") — страны нет в CTRY");
}
const ix = fs.readFileSync("index.src.html", "utf8");
for (const l of LANGS) {
  const d = I[l], pre = l === "ru" ? "" : "../";
  const v = {ver: VER, stamp: "v" + VER, lang: l, base: pre, canon: SITE + path(l, ""), ogloc: OGL[l]};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, "")}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, "index.html")}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  v.ogimg = SITE + "og-image.jpg"; v.jsonld = JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", name: "Колія", url: SITE + path(l, ""), inLanguage: l, description: d["ix.lead"]}).replace(/</g, "\\u003c");
  /* названия стран: ru — из CTRY, остальные — из словаря CN; заголовки направлений берутся из тех же ключей ix.rtOut / ix.rtIn, что и раньше */
  const names = {}, dirs = {};
  for (const c of CTRY) {
    const f = l === "ru" ? {nom: c[2], gen: c[3], name: c[1]} : (f0 => ({nom: f0[0], gen: f0[1] || f0[0], name: f0[0]}))((I.CN[c[0]] || {})[l] || [c[1]]);
    names[c[0]] = f.name;
    dirs["ua-" + c[0]] = fill(d["ix.rtOut"], f); dirs[c[0] + "-ua"] = fill(d["ix.rtIn"], f)
  }
  v.dirjson = JSON.stringify(dirs).replace(/</g, "\\u003c");
  const flag = (c, w, h) => `<img src="https://flagcdn.com/w40/${c[0]}.png" srcset="https://flagcdn.com/w80/${c[0]}.png 2x" width="${w}" height="${h}" alt="" onerror="this.replaceWith(document.createTextNode('${c[4]}'))">`;
  const has = s => PGS.some(p => p.route === s);
  v.countries = CTRY.map(c => `<li class="cc"><div class="ch">${flag(c, 29, 22)}<h3>${hx(names[c[0]])}</h3></div>${has("ua-" + c[0]) ? `<a class="btn pri d-o" href="#ua-${c[0]}">${hx(d["ix.fromUa"])}</a>` : ""}${has(c[0] + "-ua") ? `<a class="btn d-i" href="#${c[0]}-ua">${hx(d["ix.toUa"])}</a>` : ""}</li>`).join("\n");
  const chip = p => `<a class="rt ${/^ua-/.test(p.route) ? "d-o" : "d-i"}" href="${hx(p.href)}">${hx(p.title.split(" → ").map(n => stShort(n, l)).join(" → "))}</a>`;
  v.popular = CTRY.map(c => {
    const all = PGS.filter(p => ctryOf(p) === c[0]);
    if (!all.length) return "";
    /* не больше 5 строк (по 5 маршрутов «из Украины» и «в Украину») на виду; остальное — в раскрывающемся списке «Ещё маршруты» */
    const out = p => /^ua-/.test(p.route), cut = list => { const o = list.filter(out), i = list.filter(p => !out(p)); if (Math.max(o.length, i.length) <= 5) return list; const keep = new Set([...o.slice(0, 5), ...i.slice(0, 5)]); return list.filter(p => keep.has(p)) };
    const top = cut(POP[c[0]] ? all.filter(p => POP[c[0]].includes(p.href)) : all), rest = all.filter(p => !top.includes(p));
    return `<div class="pg${top.length > 5 || rest.length ? " wide" : ""}"><h3>${flag(c, 21, 16)}${hx(names[c[0]])}</h3><div class="rts">${top.map(chip).join("")}</div>${rest.length ? `<details><summary>${hx(fill(d["ix.more"], {n: rest.length}))}</summary><div class="rts">${rest.map(chip).join("")}</div></details>` : ""}</div>`
  }).filter(Boolean).join("\n");
  v.info = `<div><h3>${hx(d["ix.help.h"])}</h3><p>${hlist("phone").map(x => `<a href="tel:${hx(x.label_ru.replace(/[^\d+]/g, ""))}"><b>${hx(x.label_ru)}</b></a>`).join(" · ")}</p><p>${hx(d["ix.help.p"])}</p></div>
<div><h3>${hx(d["ix.buy.h"])}</h3><p class="lk">${hlist("buy").map(x => `<a href="${hx(x.url)}">${hx(hlab(x, l))}</a>`).join("")}</p></div>
<div><h3>${hx(d["ix.fly.h"])}</h3><p>${hx(d["ix.fly.p"])}</p><p class="lk">${hlist("airport").map(x => `<a href="${hx(x.url)}" target="_blank" rel="noopener">${hx(st(x.label_ru, l))}</a>`).join("")}</p></div>`;
  /* подвал — тот же состав, что в FOOTER_HTML (common.js); скрипт потом перерисует его так же и уточнит дату обновления */
  v.footer = footerHtml(d, l);
  const out = ix.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, "index.html"), out);
  if (l !== "ru") urls.push(SITE + path(l, ""));
  SM.push({loc: SITE + path(l, ""), alts: LANGS.map(x => [x, SITE + path(x, "")]), body: out});
}
/* служебные страницы (privacy, about, contacts): шаблон page.src.html, тексты из static-pages.js */
const pg = fs.readFileSync("page.src.html", "utf8");
for (const k of Object.keys(SP.P)) for (const l of LANGS) {
  const d = I[l], pre = l === "ru" ? "" : "../", f = k + ".html", T = SP.P[k][l], loc = SITE + path(l, f);
  const v = {ver: VER, stamp: "v" + VER, lang: l, base: pre, home: "./", canon: loc, ogloc: OGL[l], ogimg: SITE + "og-image.jpg",
    p_title: T.title, p_desc: T.desc, p_h1: T.h1, p_lead: T.lead, p_body: T.html, footer: footerHtml(d, l)};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, f)}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE + f}">`;
  v.ogalt = LANGS.filter(x => x !== l).map(x => `    <meta property="og:locale:alternate" content="${OGL[x]}">`).join("\n");
  v.langs = LANGS.map(x => `<a href="${pre + path(x, f)}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  v.jsonld = JSON.stringify({"@context": "https://schema.org", "@type": "WebPage", name: T.h1, url: loc, inLanguage: l, description: T.desc, isPartOf: {"@type": "WebSite", name: "Колія", url: SITE}}).replace(/</g, "\\u003c");
  const out = pg.replace(/\{\{([\w.]+)\}\}/g, (m, key) => key in v ? v[key] : key in d ? fill(d[key], v) : (console.warn("нет ключа", key), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, f), out);
  urls.push(loc); SM.push({loc, alts: LANGS.map(x => [x, SITE + path(x, f)]), body: out})
}
/* словари для браузера: dict/<язык>.js = русский (запасной) + язык страницы + станции + страны */
fs.mkdirSync("dict", {recursive: true});
for (const l of LANGS) {
  const d = {ru: CLIENT.ru}; if (l !== "ru") d[l] = CLIENT[l];
  d.ST = CLIENT.ST; d.CN = CLIENT.CN;
  fs.writeFileSync("dict/" + l + ".js", "/* создаётся командой node sync.js (build.js) из базы, руками не править */\nvar I18N = " + JSON.stringify(d) + ";\n")
}
/* карточки вариантов в HTML (их видят поисковики без JS): тот же renderCards из common.js, что и в браузере, на данных options.db.json.
   Нет снимка — остаётся «Загрузка…», карточки рисует браузер, как раньше. Скрипт страницы потом заменяет их свежими данными из базы. */
(() => {
  let OPTS = null; try { OPTS = JSON.parse(fs.readFileSync("options.db.json", "utf8")) } catch (e) {}
  if (!OPTS) { console.warn("build.js: нет options.db.json, карточки в HTML не вставляются (выполните node sync.js)"); return }
  const vm = require("vm"), noop = () => {}, code = fs.readFileSync("common.js", "utf8") + "\n;globalThis.__rc = renderCards;", CTX = {};
  const ctxFor = l => CTX[l] || (CTX[l] = (() => { /* общий код common.js объявляет const на верхнем уровне, поэтому свой контекст на каждый язык */
    const el = {innerHTML: "", querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, insertAdjacentHTML: noop},
      ctx = {document: {readyState: "complete", getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, createElement: () => el, body: el, documentElement: el},
        location: {pathname: "/", hash: ""}, localStorage: {getItem: () => null, setItem: noop}, MutationObserver: class { observe() {} }, console: {info: noop, warn: noop, log: noop}};
    ctx.window = ctx; ctx.CFG = Object.assign({}, CFG, {TRAIN_BADGES: BADGES}); ctx.LANG = l; ctx.I18N = new Function(fs.readFileSync("dict/" + l + ".js", "utf8") + ";return I18N")();
    vm.createContext(ctx); vm.runInContext(code, ctx); return ctx
  })());
  let n = 0, empty = 0;
  for (const p of PEND) {
    const l = p.l, ctx = ctxFor(l);
    const res = ctx.__rc(OPTS, p.C);
    if (!res.list.length) { empty++; continue } /* пустой список: оставляем «Загрузка…», браузер покажет сообщение сам */
    const html = fs.readFileSync(p.file, "utf8").replace(/<div id="app">[\s\S]*?<\/div>\n/, () => `<div id="app">${res.html}</div>\n`);
    /* разметка TrainTrip: отдельным блоком после BreadcrumbList */
    const ld = res.ld.length ? `    <script type="application/ld+json">${JSON.stringify({"@context": "https://schema.org", "@graph": res.ld}).replace(/</g, "\\u003c")}</script>\n` : "", html2 = ld ? html.replace(/(<script type="application\/ld\+json">[\s\S]*?<\/script>\n)/, (m) => m + ld) : html;
    fs.writeFileSync(p.file, html2); p.sme.body = html2; n++
  }
  console.log("карточки в HTML: " + n + " страниц" + (empty ? ", без вариантов: " + empty : ""))
})();
/* sitemap.xml: у каждой страницы языковые версии (xhtml:link) и lastmod. Дата меняется только когда изменилось содержимое страницы:
   хеш прошлой сборки лежит в sitemap-lastmod.json (его коммитит та же пересборка), версия ?v= и подпись сборки в хеш не входят. */
let LM = {}; try { LM = JSON.parse(fs.readFileSync("sitemap-lastmod.json", "utf8")) } catch (e) {}
const today = new Date().toISOString().slice(0, 10), LMN = {};
const sm = SM.map(p => {
  const h = require("crypto").createHash("md5").update(p.body.replace(/<!-- build .*?-->/g, "").replace(/\?v=[0-9a-f]{8}/g, "")).digest("hex").slice(0, 12);
  LMN[p.loc] = LM[p.loc] && LM[p.loc].h === h ? LM[p.loc] : {h, d: today};
  return `<url><loc>${p.loc}</loc><lastmod>${LMN[p.loc].d}</lastmod>\n${p.alts.map(([x, u]) => `  <xhtml:link rel="alternate" hreflang="${x}" href="${u}"/>`).join("\n")}\n  <xhtml:link rel="alternate" hreflang="x-default" href="${p.alts[0][1]}"/></url>`
});
fs.writeFileSync("sitemap-lastmod.json", JSON.stringify(LMN, null, 1) + "\n");
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.join("\n")}\n</urlset>\n`);
fs.writeFileSync("robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: " + SITE + "sitemap.xml\n");
console.log("Готово:", urls.length - 1, "страниц (+ главные)");
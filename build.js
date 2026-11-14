/* Сборка языковых версий: node build.js (обычно через node sync.js, который сначала обновляет данные из базы)
   route.src.html + переводы из базы → kyiv-warsaw.html, warsaw-kyiv.html (ru, в корне) и uk/ en/ pl/ + sitemap.xml + dict/<язык>.js
   Переводы правятся в админке (вкладки «Тексты», «Станции», «Направления»); готовые .html руками не править.
   Данные из базы лежат в снимках i18n.db.json (тексты интерфейса, станции) и routes.db.json (направления и их тексты). */
const fs = require("fs");
const SITE = "https://dmytrovertikov.github.io/koliya/", LANGS = ["ru", "uk", "en", "pl"];
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
    const a = [s.name_uk || "", s.name_en || "", s.name_pl || "", s.in_ru || "", s.in_uk || "", s.in_pl || ""];
    for (const n of [s.name_ru].concat(s.aliases || [])) if (!(n in I.ST)) I.ST[n] = a
  }
  return I
})();
/* что нужно браузеру: тексты интерфейса и станции (без текстов страниц маршрутов) */
const CLIENT = JSON.parse(JSON.stringify(I));
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
    if (p.kind === "slice") Object.assign(r, {dOnly: true, coach: false, slice: true, ds3: p.single ? "buy.d.s3z" : "buy.d.s3t"});
    else if (p.kind === "direct") Object.assign(r, {dOnly: true, coach: false, ds2: "buy.d.s2z", ds3: p.single ? "buy.d.s3z" : "buy.d.s3t"});
    else {
      const x = p.x || "Хелм";
      Object.assign(r, {uz: out ? [p.from_name, x] : [x, p.to_name], pkp: out ? [x, p.to_name] : [p.from_name, x], t3: out ? "buy.t3out" : "buy.t3in", x, direct: false, plat: x === "Хелм", xtxt: true});
      if (p.border) r.border = p.border
    }
  }
  Object.assign(r, p.extra || {});
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
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => k in v ? v[k] : m);
const path = (l, f) => (l === "ru" ? "" : l + "/") + f;
const VER = Date.now().toString(36), urls = [SITE];
const S3T = {ru: "Выберите подходящий поезд и оплатите билет банковской картой. Электронный билет появится в приложении. При посадке предъявите его вместе с паспортом.", uk: "Оберіть відповідний поїзд і сплатіть квиток банківською карткою. Електронний квиток з’явиться в застосунку. Під час посадки пред’явіть його разом із паспортом.", en: "Choose a suitable train and pay by bank card. The e-ticket will appear in the app. Show it with your passport when boarding.", pl: "Wybierz odpowiedni pociąg i zapłać kartą. E-bilet pojawi się w aplikacji. Przy wsiadaniu okaż go razem z paszportem."}; /* шаг 2 покупки для Киев ↔ Хелм: там несколько поездов, на Днепр / Харьков ↔ Хелм поезд один, у них «Выберите место» (buy.d.s3z) */
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
for (const r of ROUTES) for (const l of LANGS) {
  const d = I[l], pair = a => st(a[0], l) + " → " + st(a[1], l), pre = l === "ru" ? "" : "../";
  const v = {ver: VER, lang: l, base: pre, home: "./", FROM: r.FROM, TO: r.TO, BACK: r.BACK, hash: r.hash, rev: r.rev,
    chipRev: pair([r.TO, r.FROM]), dir: pair([r.FROM, r.TO]), uz: pair(r.uz || [r.FROM, r.TO]), pkp: pair(r.pkp || [r.FROM, r.TO]), canon: SITE + path(l, r.file)};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, r.file)}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE + r.file}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, r.file)}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  d["buy.d.s3t"] = S3T[l];
  if (r.slice || r.autotxt) { const tx = (r.xtxt ? TRANSFER_TXT : SLICE_TXT)[l](st(r.FROM, l), st(r.TO, l), r.x ? xin(r.x, l) : ""); for (const k in tx) if (!d[r.id + "." + k]) d[r.id + "." + k] = tx[k]; for (const k of ["all", "more"]) if (!d[r.id + "." + k]) d[r.id + "." + k] = d[r.like + "." + k] }
  for (const k of ["title", "desc", "h1", "lead", "all", "more"]) v["r_" + k] = fill(d[r.id + "." + k], v);
  v["buy.t3"] = fill(d[r.t3 || "buy.t3out"], v); v["buy.t.s1x"] = fill(d[r.s1 || (r.one ? "buy.t.s1one" : "buy.t.s1")], v);
  const X = r.x || "Хелм", direct = r.direct !== false, plat = r.plat !== undefined ? r.plat : X === "Хелм";
  v.stamp = new Date().toISOString() + " v" + VER + " direct=" + direct + " x=" + X;
  /* второй отрезок: PKP Intercity (по умолчанию) или другой перевозчик (car: "zssk" | "cfr" | "oebb"), у него свои тексты покупки */
  const CARS = {zssk: {url: "https://www.zssk.sk/ideme-vlakom/", s2: "buy.t.s2z", b2: "buy.t.b2z", note: "buy.note.z"}, cfr: {url: "https://bilete.cfrcalatori.ro/", s2: "buy.t.s2c", b2: "buy.t.b2c", note: "buy.note.c"}, cd: {url: "https://www.cd.cz/spojeni-a-jizdenka/", s2: "buy.t.s2cd", b2: "buy.t.b2cd", note: "buy.note.cz"}, oebb: {url: "https://tickets.oebb.at/", s2: "buy.t.s2o", b2: "buy.t.b2o", note: "buy.note.o"}, mav: {url: "https://jegy.mav.hu/", s2: "buy.t.s2m", b2: "buy.t.b2m", note: "buy.note.m"}}, cr = CARS[r.car];
  v["buy.t.url"] = cr ? cr.url : "https://www.intercity.pl/";
  v["buy.t.s2"] = fill(d[r.s2 || (cr ? cr.s2 : "buy.t.s2")], v); v["buy.t.b2"] = fill(d[cr ? cr.b2 : "buy.t.b2"], v);
  v.border = r.border ? fill(d["border." + r.border], v) : ""; v["buy.notex"] = fill(d[r.app || r.dOnly ? "buy.note.a" : cr ? cr.note : "buy.note"], v); v.xin = xin(X, l); v.hasDirect = String(direct); v.slice = String(!!r.slice); v.buyone = r.cols ? " three" : r.third && !direct && !r.dOnly ? " two" : (direct && !r.dOnly ? "" : " one") + (r.third ? " three" : "");
  v["transfer.h"] = fill(d[plat ? "transfer.h" : "transfer.h2"], v);
  const JJ = {ru: " и ", uk: " та ", en: " and ", pl: " i "}[l], hdr = a => xin(a[0], l) + a.slice(1).map(n => JJ + (l === "en" ? st(n, l) : xin(n, l).replace(/^\S+\s+/, ""))).join(""); /* hdr: «в Хелме и Варшаве» */
  /* splitx: группы {s: станция первой пересадки, l: число поездов (0 = любое), h: станции для заголовка}; split: короткая запись только со станциями */
  const SPX = r.splitx || (r.split || []).map(n => ({s: n, h: r.splith && r.splith[n]}));
  v.split = JSON.stringify(SPX.map(g => [g.s, fill(d["transfer.h2"], {xin: hdr(g.h || [g.s])}), r.border && g.s === "Перемышль" ? 1 : 0, g.l || 0])); if (SPX.length) v["transfer.h"] = fill(d["transfer.h3"], v); v["transfer.hx"] = fill(d["transfer.h3"], v); /* нейтральный заголовок «С пересадкой» — только если на странице есть прямой поезд */
  /* xs: один общий блок вариантов «С пересадкой в Чопе и Мукачево» вместо разбивки split (заголовок собирается из словаря станций) */
  /* hxs: заголовок группы и блока покупки с несколькими станциями пересадки, напр. «С пересадкой в Хелме и Варшаве» (разбивки и логики покупки не меняет) */
  if (r.hxs) { const J = {ru: " и ", uk: " та ", en: " and ", pl: " i "}[l]; const H = fill(d["transfer.h2"], {xin: hdr(r.hxs)}); if (!SPX.length) v["transfer.h"] = H; v["buy.t.h"] = H }
  if (r.xs) { const J = {ru: " и ", uk: " та ", en: " and ", pl: " i "}[l], rest = n => l === "en" ? st(n, l) : xin(n, l).replace(/^\S+\s+/, ""); const XI = xin(r.xs[0], l) + r.xs.slice(1).map(n => J + rest(n)).join(""), out = r.t3 === "buy.t3out"; if (!SPX.length) v["transfer.h"] = fill(d["transfer.h2"], {xin: XI}); /* split задан: карточки делятся на отдельные группы, xs влияет только на блок покупки */
    /* блок покупки для всех станций сразу: общий заголовок, шаги и кнопки */
    v.xp = r.xs.map(n => pair(out ? [n, r.TO] : [r.FROM, n])).join(J); v["buy.t.h"] = fill(d["transfer.h2"], {xin: xin(r.xs[0], l) + r.xs.slice(1).map(n => ({ru: " или ", uk: " або ", en: " or ", pl: " lub "})[l] + rest(n)).join("")}); v.xu = r.xs.map(n => pair(out ? [r.FROM, n] : [n, r.TO])).join({ru: " или ", uk: " або ", en: " or ", pl: " lub "}[l]); v["buy.t.s1x"] = fill(d["buy.x.s1"], v); v["buy.t.s2"] = fill(d[out ? (r.xs2o || "buy.x.s2o") : (r.xs2i || "buy.x.s2i")], v); v["buy.t.b1"] = fill(d["buy.x.b1"], v); v["buy.t.b2"] = fill(d[r.xb2 || "buy.x.b2"], v) }
  if (r.third) v["buy.h3"] = fill(d["transfer.h2"], Object.assign({}, v, {xin: xin(r.third, l)}));
  if (r.third) { /* содержимое третьего столбца: по умолчанию копия колонки про первую пересадку; h: true — свои тексты и кнопки (buy.h.*) */
    const btn = (cls, href, label) => `<a class="btn${cls}" href="${href}" target="_blank" rel="noopener">${label}</a>`;
    if (r.h) {
      const hv = Object.assign({}, v, {bud1: pair(r.hb1 || ["Киев", "Будапешт"]), bud2: pair(r.hb2 || ["Будапешт", "Вена"])});
      v["buy.h.s1"] = fill(d["buy.h.s1"], hv); v["buy.h.s2"] = fill(d["buy.h.s2"], hv);
      v["buy.h.btns"] = btn(" pri", "https://app.uz.gov.ua/start", fill(d["buy.h.b1"], hv)) + "\n" + btn("", "https://jegy.mav.hu/", fill(d["buy.h.b2"], hv)) + "\n" + btn("", "https://tickets.oebb.at/", fill(d["buy.h.b3"], hv))
    } else {
      const v3 = r.pkp3 ? Object.assign({}, v, {pkp: pair(r.pkp3), uz: pair(r.uz3 || r.uz || [r.FROM, r.TO])}) : v; v["buy.h.s1"] = r.hs1 ? fill(d[r.hs1], v3) : v["buy.t.s1x"]; v["buy.h.s2"] = r.hs2 ? fill(d[r.hs2], v3) : v["buy.t.s2"]; /* hs1/hs2: тексты третьей колонки, если у основной (s1/s2) они другие */
      v["buy.h.btns"] = btn(" pri", "https://app.uz.gov.ua/start", fill(d[r.hb1k || "buy.t.b1"], v3)) + (r.honly ? "" : "\n" + (r.hurl ? btn("", r.hurl, fill(d[r.hb2k || "buy.t.b2"], v3)) : btn("", v["buy.t.url"], v["buy.t.b2"])))
    }
  }
  /* be: Германия — польский сайт для польского участка, немецкий (bahn.de / DB Navigator) для немецкого; be.T — блок «Хелм и Варшава», be.H — блок «Перемышль» */
  let dbBtnT = "", cBlock = "";
  if (r.be) {
    const bb = (cls, href, label) => `<a class="btn${cls}" href="${href}" target="_blank" rel="noopener">${label}</a>`, DB = "https://www.bahn.de/", T = r.be.T, H = r.be.H;
    v["buy.t.s2"] = fill(d["buy.be.sT"], {pl: pair(T.pl), de: pair(T.de)}); v["buy.t.b2"] = fill(d["buy.t.b2"], {pkp: pair(T.pl)}); dbBtnT = bb("", DB, fill(d["buy.be.bd"], {de: pair(T.de)}));
    v["buy.h.s2"] = fill(d["buy.be.sH"], {pl: pair(H.pl), de: pair(H.de)});
    v["buy.h.btns"] = bb(" pri", "https://app.uz.gov.ua/start", fill(d["buy.t.b1"], {uz: pair(r.uz3 || r.uz)})) + "\n" + bb("", "https://www.intercity.pl/", fill(d["buy.t.b2"], {pkp: pair(H.pl)})) + "\n" + bb("", DB, fill(d["buy.be.bd"], {de: pair(H.de)}));
    v["buy.notex"] = d["buy.note.be"];
    const C = r.be.C, cv = {uz: pair(C.uz), de: pair(C.de)}; /* третий блок: «С пересадкой в Хелме» (Хелм ↔ Берлин одним поездом), немецкий сайт */
    cBlock = `<!--C--><div><h3>${fill(d["transfer.h2"], {xin: xin("Хелм", l)})}</h3><ol class="steps">\n<li>${fill(d["buy.t.s1"], cv)}</li>\n<li>${fill(d["buy.be.sC"], cv)}</li>\n<li>${d["buy.t.s4"]}</li></ol>\n${bb(" pri", "https://app.uz.gov.ua/start", fill(d["buy.t.b1"], cv))}\n${bb("", DB, fill(d["buy.be.bd"], cv))}</div><!--/C-->`
  }
  /* gen: варианты с разными пересадочными станциями (Чоп, Будапешт…): общие заголовок и шаги вместо «в Чопе» */
  if (r.gen) { v["transfer.h"] = v["buy.t.h"] = fill(d["transfer.h3"], v); v["buy.t.s1x"] = fill(d["buy.t.s1v"], v); v["buy.t.s2"] = fill(d["buy.t.s2v"], v); v["buy.t.b1"] = fill(d["buy.t.b1v"], v); v["buy.t.b2"] = fill(d["buy.t.b2v"], v) }
  v.leadx = r.leadx || ""; v.leadm = JSON.stringify(r.leadx && d[r.id + ".leadm"] ? fill(d[r.id + ".leadm"], v) : ""); /* leadx: станция; если на странице есть пересадка на ней, подзаголовок заменяется на <id>.leadm */
  { const k2 = r.ds2 || "buy.d.s2", s2 = fill(d[k2], v); v["buy.d.s2"] = r.id === "kw" || !/^buy\.d\.s2v?$/.test(k2) ? s2 : s2.replace(/\s*[^.]*\.\s*$/, ""); } /* фраза про высокий спрос на прямой поезд (последнее предложение) — только на странице Киев → Варшава */ v["buy.d.s3"] = fill(d[r.ds3 || "buy.d.s3"], v); /* dOnly: страница только с прямым поездом (одна колонка покупки УЗ), coach: false: без описания купе */
  const tpl0b = r.third ? tpl0 : tpl0.replace(/<!--H-->[\s\S]*?<!--\/H-->/g, ""); /* third: третий столбец покупки «С пересадкой в …» (вторая пересадочная станция) */
  /* cols: любое число блоков покупки «С пересадкой … · УЗ + перевозчик»; train — номер поезда УЗ, который нужно выбрать */
  const CARRIER = {cd: {n: "ČD", url: "https://www.cd.cz/spojeni-a-jizdenka/", s2: "buy.t.s2cd", b2: "buy.t.b2cd"}, rj: {n: "RegioJet", url: "https://regiojet.cz/", s2: "buy.t.s2rj", b2: "buy.t.b2rj"}};
  /* падежи для «отправление из … , прибытие в …»: [«из/з/z» (родительный), «в/до/do» (винительный или родительный)] */
  const CASEF = {ru: {"Киев": ["Киева", "Киев"], "Прага": ["Праги", "Прагу"]}, uk: {"Киев": ["Києва", "Києва"], "Прага": ["Праги", "Праги"]}, pl: {"Киев": ["Kijowa", "Kijowa"], "Прага": ["Pragi", "Pragi"]}};
  const cf = (n, i) => (CASEF[l] && CASEF[l][n] && CASEF[l][n][i]) || st(n, l);
  const attr = x => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const dtTpl = r.cols ? fill(d["buy.c.dt"], {a: cf(r.FROM, 0), b: cf(r.TO, 1), t1: "{t1}", t2: "{t2}"}) : "";
  v.buycols = (r.cols || []).map(c => {
    const cc = CARRIER[c.car], cv = Object.assign({}, v, {uz: pair(c.uz), pkp: pair(c.pkp), open: c.open || "08:00", train: `<span class="utr">${c.train}</span>`, xin: xin(c.x, l), car: cc.n});
    const a = (cls, href, label) => `<a class="btn${cls}" href="${href}" target="_blank" rel="noopener">${label}</a>`;
    return `<div><h3 data-car="${c.car}" data-x="${attr(c.x)}" data-dt="${attr(dtTpl)}">${fill(d["buy.c.h"], cv)}</h3><ol class="steps">\n<li>${fill(d["buy.c.s1"], cv)}</li>\n<li>${fill(d[cc.s2], cv)}</li>\n<li>${fill(d["buy.t.s4"], cv)}</li></ol>\n${a(" pri", "https://app.uz.gov.ua/start", fill(d["buy.t.b1"], cv))}\n${a("", cc.url, fill(d[cc.b2], cv))}</div>`
  }).join("\n");
  const tpl1 = direct ? tpl0b : tpl0b.replace(/<!--D-->[\s\S]*?<!--\/D-->/g, "").replace(/\/\*D\*\/[\s\S]*?\/\*\/D\*\//g, ""),
    tpl2 = r.border ? tpl1 : tpl1.replace(/\/\*B\*\/[\s\S]*?\/\*\/B\*\//g, ""),
    tpl3 = tpl2.replace(/<!--T3-->[\s\S]*?<!--\/T3-->/g, ""), /* строка «При выборе поезда … учитывайте время» убрана на всех страницах */
    tpl = r.app ? tpl3.replace(/<!--T-->[\s\S]*?<!--\/T-->/g, "") : tpl3.replace(/<!--A-->[\s\S]*?<!--\/A-->/g, "");
  const tplF = r.dOnly ? tpl.replace(/<!--T-->[\s\S]*?<!--\/T-->/g, "").replace(/<!--A-->[\s\S]*?<!--\/A-->/g, "") : tpl,
    tplC0 = r.coach === false ? tplF.replace(/\/\*C\*\/[\s\S]*?\/\*\/C\*\//g, "") : tplF,
    tplC = r.cols ? tplC0.replace(/<!--(T|H|A)-->[\s\S]*?<!--\/\1-->/g, "") : tplC0;
  let out = tplC.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (cBlock) out = out.replace("<!--/H-->", "<!--/H-->\n" + cBlock).replace('class="buy two"', 'class="buy three"');
  /* одинаковая высота кнопок покупки: текст по центру, переносы не меняют высоту */
  if (r.be) out = out.replace("</head>", "<style>.buy .btn{display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;min-height:5.6rem}</style>\n</head>");
  if (dbBtnT) out = out.replace("</div><!--/T-->", "\n" + dbBtnT + "</div><!--/T-->");
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, r.file), out);
  urls.push(SITE + path(l, r.file));
  if (l === "ru") console.log("  " + r.file + ": " + (direct ? "есть прямой поезд" : "БЕЗ прямого поезда") + ", пересадка: " + X);
}
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
/* страницы, которые показываются сразу; остальные маршруты страны лежат в раскрывающемся списке (в HTML они есть). Страна не указана — все маршруты сразу */
const POP = {pl: ["kyiv-warsaw.html", "kyiv-krakow.html", "dnipro-warsaw.html", "odesa-warsaw.html", "lviv-warsaw.html", "warsaw-kyiv.html", "krakow-kyiv.html"]};
const AIR = [["Варшава", "https://www.lotnisko-chopina.pl/en/index.html"], ["Будапешт", "https://www.bud.hu/en"], ["Вена", "https://www.viennaairport.com/"], ["Краков", "https://www.krakowairport.pl/en/"], ["Жешув", "https://www.rzeszowairport.pl/ua"], ["Кошице", "https://www.airportkosice.sk/en"], ["Кишинёв", "https://airport.md/"], ["Яссы", "https://www.aeroport-iasi.ro"]];
const OGL = {ru: "ru_RU", uk: "uk_UA", en: "en_US", pl: "pl_PL"};
const ctryOf = p => p.route.replace(/^ua-|-ua$/, "");
for (const p of PGS) { /* проверки: ссылки главной ведут только на существующие страницы и страны */
  if (!CTRY.some(c => c[0] === ctryOf(p))) throw new Error("build.js: страница " + p.href + " (route " + p.route + ") — страны нет в CTRY");
}
/* страницы, выключенные в админке, пропадают и из списков «популярное» на главной */
const OFF = new Set(DBR.filter(p => p.active === false).map(p => p.file));
for (const k of Object.keys(POP)) POP[k] = POP[k].filter(h => !OFF.has(h));
for (const h of [].concat(...Object.values(POP))) if (!PGS.some(p => p.href === h)) throw new Error("build.js: POP ссылается на отсутствующую страницу " + h);
const ix = fs.readFileSync("index.src.html", "utf8");
for (const l of LANGS) {
  const d = I[l], pre = l === "ru" ? "" : "../";
  const v = {ver: VER, stamp: new Date().toISOString() + " v" + VER, lang: l, base: pre, canon: SITE + path(l, ""), ogloc: OGL[l]};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, "")}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, "index.html")}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  v.jsonld = JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", name: "Колія", url: SITE + path(l, ""), inLanguage: l, description: d["ix.lead"]}).replace(/</g, "\\u003c");
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
  const chip = p => `<a class="rt ${/^ua-/.test(p.route) ? "d-o" : "d-i"}" href="${hx(p.href)}">${hx(p.title.split(" → ").map(n => st(n, l)).join(" → "))}</a>`;
  v.popular = CTRY.map(c => {
    const all = PGS.filter(p => ctryOf(p) === c[0]);
    if (!all.length) return "";
    const top = POP[c[0]] ? all.filter(p => POP[c[0]].includes(p.href)) : all, rest = all.filter(p => !top.includes(p));
    return `<div class="pg"><h3>${flag(c, 21, 16)}${hx(names[c[0]])}</h3><div class="rts">${top.map(chip).join("")}</div>${rest.length ? `<details><summary>${hx(fill(d["ix.more"], {n: rest.length}))}</summary><div class="rts">${rest.map(chip).join("")}</div></details>` : ""}</div>`
  }).filter(Boolean).join("\n");
  v.info = `<div><h3>${hx(d["ix.help.h"])}</h3><p><a href="tel:0800503111"><b>0 800 503 111</b></a> · <a href="tel:0444653344"><b>044 465 33 44</b></a></p><p>${hx(d["ix.help.p"])}</p></div>
<div><h3>${hx(d["ix.buy.h"])}</h3><p class="lk"><a href="https://app.uz.gov.ua/start">${hx(d["ix.buy.b1"])}</a><a href="https://uz.gov.ua/">${hx(d["ix.buy.b2"])}</a></p></div>
<div><h3>${hx(d["ix.fly.h"])}</h3><p>${hx(d["ix.fly.p"])}</p><p class="lk">${AIR.map(a => `<a href="${a[1]}" target="_blank" rel="noopener">${hx(st(a[0], l))}</a>`).join("")}</p></div>`;
  /* подвал — тот же состав, что в FOOTER_HTML (common.js); скрипт потом перерисует его так же */
  v.footer = `<div class="fcols">\n<div><b>🚆 Колія</b><p>${d.f1}</p></div>\n<div><b>${d.f2h}</b>\n<p>${d.f2a}</p>\n<p>${d.f2b}</p>\n<p>${d.f2c}</p></div>\n<div><b>${d.f3h}</b><p>${d.f3}</p></div></div>\n<p class="fine">${d.fsrc} <a href="https://uz.gov.ua/">uz.gov.ua</a> · <a href="https://intercity.pl/">intercity.pl</a> · © ${new Date().getFullYear()} Колія</p>`;
  const out = ix.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, "index.html"), out);
  if (l !== "ru") urls.push(SITE + path(l, ""));
}
/* словари для браузера: dict/<язык>.js = русский (запасной) + язык страницы + станции + страны */
fs.mkdirSync("dict", {recursive: true});
for (const l of LANGS) {
  const d = {ru: CLIENT.ru}; if (l !== "ru") d[l] = CLIENT[l];
  d.ST = CLIENT.ST; d.CN = CLIENT.CN;
  fs.writeFileSync("dict/" + l + ".js", "/* создаётся командой node sync.js (build.js) из базы, руками не править */\nvar I18N = " + JSON.stringify(d) + ";\n")
}
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log("Готово:", urls.length - 1, "страниц (+ главные)");
/* Сборка языковых версий: node build.js
   route.src.html + i18n.js → kyiv-warsaw.html, warsaw-kyiv.html (ru, в корне) и uk/ en/ pl/ + sitemap.xml
   Тексты правятся только в i18n.js и route.src.html; готовые .html руками не править. */
const fs = require("fs"), I = require("./i18n.js");
const SITE = "https://dmytrovertikov.github.io/koliya/", LANGS = ["ru", "uk", "en", "pl"];
const ROUTES = [
  {id: "kw", file: "kyiv-warsaw.html", FROM: "Киев", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-kyiv.html", uz: ["Киев", "Хелм"], pkp: ["Хелм", "Варшава"], t3: "buy.t3out"},
  {id: "wk", file: "warsaw-kyiv.html", FROM: "Варшава", TO: "Киев", BACK: "ua-pl", hash: "pl-ua", rev: "kyiv-warsaw.html", uz: ["Хелм", "Киев"], pkp: ["Варшава", "Хелм"], t3: "buy.t3in"},
  {id: "kyiv_krakow", file: "kyiv-krakow.html", FROM: "Киев", TO: "Краков", BACK: "pl-ua", hash: "ua-pl", rev: "krakow-kyiv.html", uz: ["Киев","Перемышль"], pkp: ["Перемышль","Краков"], t3: "buy.t3out", x: "Перемышль", direct: false, border: "after"},
  {id: "krakow_kyiv", file: "krakow-kyiv.html", FROM: "Краков", TO: "Киев", BACK: "ua-pl", hash: "pl-ua", rev: "kyiv-krakow.html", uz: ["Перемышль","Киев"], pkp: ["Краков","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, border: "before"},
  {id: "dnipro_warsaw", file: "dnipro-warsaw.html", FROM: "Днепр", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-dnipro.html", uz: ["Днепр","Хелм"], pkp: ["Хелм","Варшава"], t3: "buy.t3out", x: "Хелм", direct: false, plat: false, one: true},
  {id: "warsaw_dnipro", file: "warsaw-dnipro.html", FROM: "Варшава", TO: "Днепр", BACK: "ua-pl", hash: "pl-ua", rev: "dnipro-warsaw.html", uz: ["Хелм","Днепр"], pkp: ["Варшава","Хелм"], t3: "buy.t3in", x: "Хелм", direct: false, plat: false, one: true},
  {id: "dnipro_krakow", file: "dnipro-krakow.html", FROM: "Днепр", TO: "Краков", BACK: "pl-ua", hash: "ua-pl", rev: "krakow-dnipro.html", uz: ["Днепр","Перемышль"], pkp: ["Перемышль","Краков"], t3: "buy.t3out", x: "Перемышль", direct: false, border: "after", one: true},
  {id: "krakow_dnipro", file: "krakow-dnipro.html", FROM: "Краков", TO: "Днепр", BACK: "ua-pl", hash: "pl-ua", rev: "dnipro-krakow.html", uz: ["Перемышль","Днепр"], pkp: ["Краков","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, border: "before", one: true},
  {id: "kharkiv_warsaw", file: "kharkiv-warsaw.html", FROM: "Харьков", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-kharkiv.html", uz: ["Харьков","Хелм"], pkp: ["Хелм","Варшава"], t3: "buy.t3out", x: "Хелм", direct: false, plat: false, one: true},
  {id: "warsaw_kharkiv", file: "warsaw-kharkiv.html", FROM: "Варшава", TO: "Харьков", BACK: "ua-pl", hash: "pl-ua", rev: "kharkiv-warsaw.html", uz: ["Хелм","Харьков"], pkp: ["Варшава","Хелм"], t3: "buy.t3in", x: "Хелм", direct: false, plat: false, one: true},
  {id: "kharkiv_krakow", file: "kharkiv-krakow.html", FROM: "Харьков", TO: "Краков", BACK: "pl-ua", hash: "ua-pl", rev: "krakow-kharkiv.html", uz: ["Харьков","Перемышль"], pkp: ["Перемышль","Краков"], t3: "buy.t3out", x: "Перемышль", direct: false, border: "after", one: true},
  {id: "krakow_kharkiv", file: "krakow-kharkiv.html", FROM: "Краков", TO: "Харьков", BACK: "ua-pl", hash: "pl-ua", rev: "kharkiv-krakow.html", uz: ["Перемышль","Харьков"], pkp: ["Краков","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, border: "before", one: true},
  {id: "odesa_warsaw", file: "odesa-warsaw.html", FROM: "Одесса", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-odesa.html", uz: ["Одесса","Перемышль"], pkp: ["Перемышль","Варшава"], t3: "buy.t3out", x: "Перемышль", direct: false, plat: false, border: "after", one: true},
  {id: "warsaw_odesa", file: "warsaw-odesa.html", FROM: "Варшава", TO: "Одесса", BACK: "ua-pl", hash: "pl-ua", rev: "odesa-warsaw.html", uz: ["Перемышль","Одесса"], pkp: ["Варшава","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, plat: false, border: "before", one: true},
  {id: "odesa_krakow", file: "odesa-krakow.html", FROM: "Одесса", TO: "Краков", BACK: "pl-ua", hash: "ua-pl", rev: "krakow-odesa.html", uz: ["Одесса","Перемышль"], pkp: ["Перемышль","Краков"], t3: "buy.t3out", x: "Перемышль", direct: false, border: "after", one: true},
  {id: "krakow_odesa", file: "krakow-odesa.html", FROM: "Краков", TO: "Одесса", BACK: "ua-pl", hash: "pl-ua", rev: "odesa-krakow.html", uz: ["Перемышль","Одесса"], pkp: ["Краков","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, border: "before", one: true},
  {id: "lviv_warsaw", file: "lviv-warsaw.html", FROM: "Львов", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-lviv.html", uz: ["Львов","Перемышль"], pkp: ["Перемышль","Варшава"], t3: "buy.t3out", x: "Рава-Русская", direct: false, plat: false, app: true},
  {id: "warsaw_lviv", file: "warsaw-lviv.html", FROM: "Варшава", TO: "Львов", BACK: "ua-pl", hash: "pl-ua", rev: "lviv-warsaw.html", uz: ["Перемышль","Львов"], pkp: ["Варшава","Перемышль"], t3: "buy.t3in", x: "Рава-Русская", direct: false, plat: false, app: true},
  {id: "lviv_krakow", file: "lviv-krakow.html", FROM: "Львов", TO: "Краков", BACK: "pl-ua", hash: "ua-pl", rev: "krakow-lviv.html", uz: ["Львов","Перемышль"], pkp: ["Перемышль","Краков"], t3: "buy.t3out", x: "Перемышль", direct: false, border: "after"},
  {id: "krakow_lviv", file: "krakow-lviv.html", FROM: "Краков", TO: "Львов", BACK: "ua-pl", hash: "pl-ua", rev: "lviv-krakow.html", uz: ["Перемышль","Львов"], pkp: ["Краков","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, border: "before"},
  {id: "kremenchuk_warsaw", file: "kremenchuk-warsaw.html", FROM: "Кременчуг", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-kremenchuk.html", uz: ["Кременчуг","Перемышль"], pkp: ["Перемышль","Варшава"], t3: "buy.t3out", x: "Перемышль", direct: false, plat: false, border: "after", one: true},
  {id: "warsaw_kremenchuk", file: "warsaw-kremenchuk.html", FROM: "Варшава", TO: "Кременчуг", BACK: "ua-pl", hash: "pl-ua", rev: "kremenchuk-warsaw.html", uz: ["Перемышль","Кременчуг"], pkp: ["Варшава","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, plat: false, border: "before", one: true},
  {id: "kremenchuk_krakow", file: "kremenchuk-krakow.html", FROM: "Кременчуг", TO: "Краков", BACK: "pl-ua", hash: "ua-pl", rev: "krakow-kremenchuk.html", uz: ["Кременчуг","Перемышль"], pkp: ["Перемышль","Краков"], t3: "buy.t3out", x: "Перемышль", direct: false, border: "after", one: true},
  {id: "krakow_kremenchuk", file: "krakow-kremenchuk.html", FROM: "Краков", TO: "Кременчуг", BACK: "ua-pl", hash: "pl-ua", rev: "kremenchuk-krakow.html", uz: ["Перемышль","Кременчуг"], pkp: ["Краков","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, border: "before", one: true},
  {id: "kyiv_bratislava", file: "kyiv-bratislava.html", FROM: "Киев", TO: "Братислава", BACK: "sk-ua", hash: "ua-sk", rev: "bratislava-kyiv.html", uz: ["Киев","Чоп"], pkp: ["Чоп","Братислава"], t3: "buy.t3out", x: "Чоп", direct: false, plat: false, car: "zssk", s1: "buy.t.s1kv", s2: "buy.t.s2zk"},
  {id: "bratislava_kyiv", file: "bratislava-kyiv.html", FROM: "Братислава", TO: "Киев", BACK: "ua-sk", hash: "sk-ua", rev: "kyiv-bratislava.html", uz: ["Чоп","Киев"], pkp: ["Братислава","Чоп"], t3: "buy.t3in", x: "Чоп", direct: false, plat: false, car: "zssk", s1: "buy.t.s1vk"},
  {id: "kyiv_bucharest", file: "kyiv-bucharest.html", FROM: "Киев", TO: "Бухарест", BACK: "ro-ua", hash: "ua-ro", rev: "bucharest-kyiv.html", dOnly: true, coach: false, ds2: "buy.d.s2z", ds3: "buy.d.s3z"},
  {id: "bucharest_kyiv", file: "bucharest-kyiv.html", FROM: "Бухарест", TO: "Киев", BACK: "ua-ro", hash: "ro-ua", rev: "kyiv-bucharest.html", dOnly: true, coach: false, ds2: "buy.d.s2z", ds3: "buy.d.s3z"},
  {id: "kyiv_vienna", file: "kyiv-vienna.html", FROM: "Киев", TO: "Вена", BACK: "at-ua", hash: "ua-at", rev: "vienna-kyiv.html", uz: ["Киев","Чоп"], pkp: ["Чоп","Вена"], t3: "buy.t3out", x: "Чоп", plat: false, car: "oebb", s1: "buy.t.s1kv", s2: "buy.t.s2ov", ds2: "buy.d.s2v", third: "Будапешт", h: true},
  {id: "vienna_kyiv", file: "vienna-kyiv.html", FROM: "Вена", TO: "Киев", BACK: "ua-at", hash: "at-ua", rev: "kyiv-vienna.html", uz: ["Чоп","Киев"], pkp: ["Вена","Чоп"], t3: "buy.t3in", x: "Чоп", plat: false, car: "oebb", s1: "buy.t.s1vk", s2: "buy.t.s2vk", h: true, hb1: ["Будапешт", "Киев"], hb2: ["Вена", "Будапешт"], ds2: "buy.d.s2v", third: "Будапешт"},
  {id: "kyiv_budapest", file: "kyiv-budapest.html", FROM: "Киев", TO: "Будапешт", BACK: "hu-ua", hash: "ua-hu", rev: "budapest-kyiv.html", uz: ["Киев","Чоп"], pkp: ["Чоп","Будапешт"], t3: "buy.t3out", x: "Чоп", plat: false, car: "mav", split: ["Чоп","Мукачево"], xs: ["Чоп","Мукачево"], leadx: "Мукачево", s2: "buy.t.s2mo", s1: "buy.m.s1", ds2: "buy.d.s2v", ds3: "buy.d.s3z", coach: false},
  {id: "budapest_kyiv", file: "budapest-kyiv.html", FROM: "Будапешт", TO: "Киев", BACK: "ua-hu", hash: "hu-ua", rev: "kyiv-budapest.html", uz: ["Чоп","Киев"], pkp: ["Будапешт","Чоп"], t3: "buy.t3in", x: "Чоп", plat: false, car: "mav", s2: "buy.t.s2mi", s1: "buy.m.s1", ds2: "buy.d.s2v", ds3: "buy.d.s3z", coach: false},
  {id: "kyiv_chisinau", file: "kyiv-chisinau.html", FROM: "Киев", TO: "Кишинев", BACK: "md-ua", hash: "ua-md", rev: "chisinau-kyiv.html", dOnly: true, coach: false, ds2: "buy.d.s2z", ds3: "buy.d.s3z"},
  {id: "chisinau_kyiv", file: "chisinau-kyiv.html", FROM: "Кишинев", TO: "Киев", BACK: "ua-md", hash: "md-ua", rev: "kyiv-chisinau.html", dOnly: true, coach: false, ds2: "buy.d.s2z", ds3: "buy.d.s3z"},
  {id: "kyiv_berlin", file: "kyiv-berlin.html", FROM: "Киев", TO: "Берлин", BACK: "de-ua", hash: "ua-de", rev: "berlin-kyiv.html", uz: ["Киев","Хелм"], pkp: ["Хелм","Берлин"], t3: "buy.t3out", x: "Хелм", direct: false, splitx: [{s: "Перемышль"}, {s: "Хелм", l: 3, h: ["Хелм","Варшава"]}, {s: "Хелм", l: 2}], border: "after", leadx: "Перемышль", hxs: ["Хелм","Варшава"], third: "Перемышль", uz3: ["Киев","Перемышль"], pkp3: ["Перемышль","Берлин"], hs1: "buy.t.s1", hs2: "buy.t.s2", hurl: "https://www.intercity.pl/", hb2k: "buy.t.b2", be: {T: {pl: ["Хелм","Варшава"], de: ["Варшава","Берлин"]}, C: {uz: ["Киев","Хелм"], de: ["Хелм","Берлин"]}, H: {pl: ["Перемышль","Берлин"], de: ["Перемышль","Берлин"]}}},
  {id: "berlin_kyiv", file: "berlin-kyiv.html", FROM: "Берлин", TO: "Киев", BACK: "ua-de", hash: "de-ua", rev: "kyiv-berlin.html", uz: ["Хелм","Киев"], pkp: ["Берлин","Хелм"], t3: "buy.t3in", x: "Хелм", direct: false, splitx: [{s: "Перемышль"}, {s: "Варшава", l: 3, h: ["Варшава","Хелм"]}, {s: "Хелм", l: 2}], border: "before", leadx: "Перемышль", hxs: ["Варшава","Хелм"], third: "Перемышль", uz3: ["Перемышль","Киев"], pkp3: ["Берлин","Перемышль"], hs1: "buy.t.s1", hs2: "buy.t.s2", hurl: "https://www.intercity.pl/", hb2k: "buy.t.b2", be: {T: {pl: ["Варшава","Хелм"], de: ["Берлин","Варшава"]}, C: {uz: ["Хелм","Киев"], de: ["Берлин","Хелм"]}, H: {pl: ["Берлин","Перемышль"], de: ["Берлин","Перемышль"]}}},
  {id: "kyiv_kosice", file: "kyiv-kosice.html", FROM: "Киев", TO: "Кошице", BACK: "sk-ua", hash: "ua-sk", rev: "kosice-kyiv.html", uz: ["Киев","Чоп"], pkp: ["Чоп","Кошице"], t3: "buy.t3out", x: "Чоп", direct: false, plat: false, car: "zssk", split: ["Чоп","Мукачево"], xs: ["Чоп","Мукачево"], leadx: "Мукачево", xs2o: "buy.x.s2z", xs2i: "buy.x.s2z", xb2: "buy.x.b2z", s1: "buy.m.s1"},
  {id: "kosice_kyiv", file: "kosice-kyiv.html", FROM: "Кошице", TO: "Киев", BACK: "ua-sk", hash: "sk-ua", rev: "kyiv-kosice.html", uz: ["Мукачево","Киев"], pkp: ["Кошице","Мукачево"], t3: "buy.t3in", x: "Мукачево", direct: false, plat: false, car: "zssk", s1: "buy.m.s1"},
  {id: "kyiv_prague", file: "kyiv-prague.html", FROM: "Киев", TO: "Прага", BACK: "cz-ua", hash: "ua-cz", rev: "prague-kyiv.html", uz: ["Киев","Перемышль"], pkp: ["Перемышль","Прага"], t3: "buy.t3out", x: "Перемышль", direct: false, plat: false, car: "cd", split: ["Перемышль","Чоп"], border: "after", cols: [
    {x: "Перемышль", open: "09:00", car: "cd", train: "051К", uz: ["Киев","Перемышль"], pkp: ["Перемышль","Прага"]},
    {x: "Перемышль", open: "09:00", car: "rj", train: "715К", uz: ["Киев","Перемышль"], pkp: ["Перемышль","Прага"]},
    {x: "Чоп", car: "rj", train: "059К", uz: ["Киев","Чоп"], pkp: ["Чоп","Прага"]}]},
  {id: "prague_kyiv", file: "prague-kyiv.html", FROM: "Прага", TO: "Киев", BACK: "ua-cz", hash: "cz-ua", rev: "kyiv-prague.html", uz: ["Перемышль","Киев"], pkp: ["Прага","Перемышль"], t3: "buy.t3in", x: "Перемышль", direct: false, plat: false, car: "cd", split: ["Перемышль","Чоп"], border: "before", cols: [
    {x: "Перемышль", open: "09:00", car: "cd", train: "052Л", uz: ["Перемышль","Киев"], pkp: ["Прага","Перемышль"]},
    {x: "Перемышль", open: "09:00", car: "rj", train: "716Л", uz: ["Перемышль","Киев"], pkp: ["Прага","Перемышль"]},
    {x: "Чоп", car: "rj", train: "060Л", uz: ["Чоп","Киев"], pkp: ["Прага","Чоп"]}]},
];
/* проверки: повторы в ROUTES и повторяющиеся ключи в i18n.js (при повторе побеждает ПОСЛЕДНИЙ, из-за этого старые тексты могут «возвращаться») */
{
  const seen = {};
  for (const r of ROUTES) for (const k of ["id", "file"]) { if (seen[k + r[k]]) throw new Error("build.js: в ROUTES повтор " + k + " = " + r[k] + ". Оставьте одну запись."); seen[k + r[k]] = 1 }
  const src = fs.readFileSync("i18n.js", "utf8");
  for (const l of LANGS) {
    const m = src.match(new RegExp("\\n" + l + ":\\{([\\s\\S]*?)\\n\\}")), cnt = {};
    for (const k of (m ? m[1].match(/"[^"\n]+"(?=:)/g) || [] : [])) cnt[k] = (cnt[k] || 0) + 1;
    const dup = Object.keys(cnt).filter(k => cnt[k] > 1);
    if (dup.length) console.warn("ВНИМАНИЕ i18n.js, блок " + l + ": повторяющиеся ключи (действует последний): " + dup.join(", "));
  }
}
const tpl0 = fs.readFileSync("route.src.html", "utf8");
const VIA = {ru: "через", uk: "через", en: "via", pl: "przez"};
/* «в Хелме» / «in Chełm»: из словаря станций; нет формы — «через Название» */
const xin = (n, l) => { const s = I.ST[n], i = {ru: 3, uk: 4, pl: 5}[l]; return l === "en" ? "in " + st(n, l) : s && s[i] ? s[i] : VIA[l] + " " + st(n, l) };
const st = (n, l) => { const s = I.ST[n], i = {uk: 0, en: 1, pl: 2}[l]; return s && i != null && s[i] ? s[i] : n };
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => k in v ? v[k] : m);
const path = (l, f) => (l === "ru" ? "" : l + "/") + f;
const VER = Date.now().toString(36), urls = [SITE];
for (const r of ROUTES) for (const l of LANGS) {
  const d = I[l], pair = a => st(a[0], l) + " → " + st(a[1], l), pre = l === "ru" ? "" : "../";
  const v = {ver: VER, lang: l, base: pre, home: "./", FROM: r.FROM, TO: r.TO, BACK: r.BACK, hash: r.hash, rev: r.rev,
    chipRev: pair([r.TO, r.FROM]), dir: pair([r.FROM, r.TO]), uz: pair(r.uz || [r.FROM, r.TO]), pkp: pair(r.pkp || [r.FROM, r.TO]), canon: SITE + path(l, r.file)};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, r.file)}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE + r.file}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, r.file)}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  for (const k of ["title", "desc", "h1", "lead", "all", "more"]) v["r_" + k] = fill(d[r.id + "." + k], v);
  v["buy.t3"] = fill(d[r.t3 || "buy.t3out"], v); v["buy.t.s1x"] = fill(d[r.s1 || (r.one ? "buy.t.s1one" : "buy.t.s1")], v);
  const X = r.x || "Хелм", direct = r.direct !== false, plat = r.plat !== undefined ? r.plat : X === "Хелм";
  v.stamp = new Date().toISOString() + " v" + VER + " direct=" + direct + " x=" + X;
  /* второй отрезок: PKP Intercity (по умолчанию) или другой перевозчик (car: "zssk" | "cfr" | "oebb"), у него свои тексты покупки */
  const CARS = {zssk: {url: "https://www.zssk.sk/ideme-vlakom/", s2: "buy.t.s2z", b2: "buy.t.b2z", note: "buy.note.z"}, cfr: {url: "https://bilete.cfrcalatori.ro/", s2: "buy.t.s2c", b2: "buy.t.b2c", note: "buy.note.c"}, cd: {url: "https://www.cd.cz/spojeni-a-jizdenka/", s2: "buy.t.s2cd", b2: "buy.t.b2cd", note: "buy.note.cz"}, oebb: {url: "https://tickets.oebb.at/", s2: "buy.t.s2o", b2: "buy.t.b2o", note: "buy.note.o"}, mav: {url: "https://jegy.mav.hu/", s2: "buy.t.s2m", b2: "buy.t.b2m", note: "buy.note.m"}}, cr = CARS[r.car];
  v["buy.t.url"] = cr ? cr.url : "https://www.intercity.pl/";
  v["buy.t.s2"] = fill(d[r.s2 || (cr ? cr.s2 : "buy.t.s2")], v); v["buy.t.b2"] = fill(d[cr ? cr.b2 : "buy.t.b2"], v);
  v.border = r.border ? fill(d["border." + r.border], v) : ""; v["buy.notex"] = fill(d[r.app || r.dOnly ? "buy.note.a" : cr ? cr.note : "buy.note"], v); v.xin = xin(X, l); v.hasDirect = String(direct); v.buyone = r.cols ? " three" : r.third && !direct && !r.dOnly ? " two" : (direct && !r.dOnly ? "" : " one") + (r.third ? " three" : "");
  v["transfer.h"] = fill(d[plat ? "transfer.h" : "transfer.h2"], v);
  const JJ = {ru: " и ", uk: " та ", en: " and ", pl: " i "}[l], hdr = a => xin(a[0], l) + a.slice(1).map(n => JJ + (l === "en" ? st(n, l) : xin(n, l).replace(/^\S+\s+/, ""))).join(""); /* hdr: «в Хелме и Варшаве» */
  /* splitx: группы {s: станция первой пересадки, l: число поездов (0 = любое), h: станции для заголовка}; split: короткая запись только со станциями */
  const SPX = r.splitx || (r.split || []).map(n => ({s: n, h: r.splith && r.splith[n]}));
  v.split = JSON.stringify(SPX.map(g => [g.s, fill(d["transfer.h2"], {xin: hdr(g.h || [g.s])}), r.border && g.s === "Перемышль" ? 1 : 0, g.l || 0])); if (SPX.length) v["transfer.h"] = fill(d["transfer.h3"], v); /* split: страница делится на подзаголовки «С пересадкой в …» */
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
  v["buy.d.s2"] = fill(d[r.ds2 || "buy.d.s2"], v); v["buy.d.s3"] = fill(d[r.ds3 || "buy.d.s3"], v); /* dOnly: страница только с прямым поездом (одна колонка покупки УЗ), coach: false: без описания купе */
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
  out = out.replace("</head>", "<style>.buy .btn{display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;min-height:5.6rem}</style>\n</head>");
  if (dbBtnT) out = out.replace("</div><!--/T-->", "\n" + dbBtnT + "</div><!--/T-->");
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, r.file), out);
  urls.push(SITE + path(l, r.file));
  if (l === "ru") console.log("  " + r.file + ": " + (direct ? "есть прямой поезд" : "БЕЗ прямого поезда") + ", пересадка: " + X);
}
/* главная и страницы направлений (одна страница, направление в #hash) */
const ix = fs.readFileSync("index.src.html", "utf8");
for (const l of LANGS) {
  const d = I[l], pre = l === "ru" ? "" : "../";
  const v = {ver: VER, stamp: new Date().toISOString() + " v" + VER, lang: l, base: pre, canon: SITE + path(l, "")};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, "")}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, "index.html")}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  const out = ix.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, "index.html"), out);
  if (l !== "ru") urls.push(SITE + path(l, ""));
}
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log("Готово:", urls.length - 1, "страниц (+ главные)");

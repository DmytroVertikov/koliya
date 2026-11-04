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
  {id: "kyiv_bratislava", file: "kyiv-bratislava.html", FROM: "Киев", TO: "Братислава", BACK: "sk-ua", hash: "ua-sk", rev: "bratislava-kyiv.html", uz: ["Киев","Чоп"], pkp: ["Чоп","Братислава"], t3: "buy.t3out", x: "Чоп", direct: false, plat: false, car: "zssk", s1: "buy.t.s1z", s2: "buy.t.s2zk"},
  {id: "bratislava_kyiv", file: "bratislava-kyiv.html", FROM: "Братислава", TO: "Киев", BACK: "ua-sk", hash: "sk-ua", rev: "kyiv-bratislava.html", uz: ["Чоп","Киев"], pkp: ["Братислава","Чоп"], t3: "buy.t3in", x: "Чоп", direct: false, plat: false, car: "zssk", s1: "buy.t.s1z"}
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
    chipRev: pair([r.TO, r.FROM]), dir: pair([r.FROM, r.TO]), uz: pair(r.uz), pkp: pair(r.pkp), canon: SITE + path(l, r.file)};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, r.file)}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE + r.file}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, r.file)}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  for (const k of ["title", "desc", "h1", "lead", "all", "more"]) v["r_" + k] = fill(d[r.id + "." + k], v);
  v["buy.t3"] = fill(d[r.t3], v); v["buy.t.s1x"] = fill(d[r.s1 || (r.one ? "buy.t.s1one" : "buy.t.s1")], v);
  const X = r.x || "Хелм", direct = r.direct !== false, plat = r.plat !== undefined ? r.plat : X === "Хелм";
  v.stamp = new Date().toISOString() + " v" + VER + " direct=" + direct + " x=" + X;
  const z = r.car === "zssk"; /* второй отрезок у словацкого перевозчика ZSSK, а не PKP Intercity */
  v["buy.t.url"] = z ? "https://www.zssk.sk/ideme-vlakom/" : "https://www.intercity.pl/";
  v["buy.t.s2"] = fill(d[r.s2 || (z ? "buy.t.s2z" : "buy.t.s2")], v); v["buy.t.b2"] = fill(d[z ? "buy.t.b2z" : "buy.t.b2"], v);
  v.border = r.border ? fill(d["border." + r.border], v) : ""; v["buy.notex"] = fill(d[r.app ? "buy.note.a" : z ? "buy.note.z" : "buy.note"], v); v.xin = xin(X, l); v.hasDirect = String(direct); v.buyone = direct ? "" : " one";
  v["transfer.h"] = fill(d[plat ? "transfer.h" : "transfer.h2"], v);
  const tpl1 = direct ? tpl0 : tpl0.replace(/<!--D-->[\s\S]*?<!--\/D-->/g, "").replace(/\/\*D\*\/[\s\S]*?\/\*\/D\*\//g, ""),
    tpl2 = r.border ? tpl1 : tpl1.replace(/\/\*B\*\/[\s\S]*?\/\*\/B\*\//g, ""),
    tpl3 = r.one || r.car === "zssk" ? tpl2.replace(/<!--T3-->[\s\S]*?<!--\/T3-->/g, "") : tpl2,
    tpl = r.app ? tpl3.replace(/<!--T-->[\s\S]*?<!--\/T-->/g, "") : tpl3.replace(/<!--A-->[\s\S]*?<!--\/A-->/g, "");
  const out = tpl.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
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

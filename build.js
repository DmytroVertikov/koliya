/* Сборка языковых версий: node build.js
   route.src.html + i18n.js → kyiv-warsaw.html, warsaw-kyiv.html (ru, в корне) и uk/ en/ pl/ + sitemap.xml
   Тексты правятся только в i18n.js и route.src.html; готовые .html руками не править. */
const fs = require("fs"), I = require("./i18n.js");
const SITE = "https://dmytrovertikov.github.io/koliya/", LANGS = ["ru", "uk", "en", "pl"];
const ROUTES = [
  {id: "kw", file: "kyiv-warsaw.html", FROM: "Киев", TO: "Варшава", BACK: "pl-ua", hash: "ua-pl", rev: "warsaw-kyiv.html", uz: ["Киев", "Хелм"], pkp: ["Хелм", "Варшава"], t3: "buy.t3out"},
  {id: "wk", file: "warsaw-kyiv.html", FROM: "Варшава", TO: "Киев", BACK: "ua-pl", hash: "pl-ua", rev: "kyiv-warsaw.html", uz: ["Хелм", "Киев"], pkp: ["Варшава", "Хелм"], t3: "buy.t3in"}
];
const tpl = fs.readFileSync("route.src.html", "utf8");
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
  v["buy.t3"] = fill(d[r.t3], v);
  const out = tpl.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, r.file), out);
  urls.push(SITE + path(l, r.file));
}
/* главная и страницы направлений (одна страница, направление в #hash) */
const ix = fs.readFileSync("index.src.html", "utf8");
for (const l of LANGS) {
  const d = I[l], pre = l === "ru" ? "" : "../";
  const v = {ver: VER, lang: l, base: pre, canon: SITE + path(l, "")};
  v.alts = LANGS.map(x => `    <link rel="alternate" hreflang="${x}" href="${SITE + path(x, "")}">`).join("\n") + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}">`;
  v.langs = LANGS.map(x => `<a href="${pre + path(x, "index.html")}" hreflang="${x}" lang="${x}"${x === l ? ' class="on"' : ""}>${x.toUpperCase()}</a>`).join("");
  const out = ix.replace(/\{\{([\w.]+)\}\}/g, (m, k) => k in v ? v[k] : k in d ? fill(d[k], v) : (console.warn("нет ключа", k), m));
  if (l !== "ru") fs.mkdirSync(l, {recursive: true});
  fs.writeFileSync(path(l, "index.html"), out);
  if (l !== "ru") urls.push(SITE + path(l, ""));
}
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log("Готово:", urls.length - 1, "страниц (+ главные)");

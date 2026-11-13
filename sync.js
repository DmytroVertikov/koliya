/* Колія: node sync.js
   1) забирает направления, добавленные в админке (Supabase, таблица route_pages, только активные) → routes.db.json
   2) обновляет в config.js блок DB-PAGES (список страниц для главной и страниц направлений)
   3) запускает сборку build.js
   Вместо прежнего «node build.js» теперь запускать «node sync.js». Если база недоступна, берётся прежний routes.db.json.
   Нужен Node 18+ (встроенный fetch). */
const fs = require("fs");
const BEGIN = "/*DB-PAGES:BEGIN", END = "/*DB-PAGES:END*/";
const cfgSrc = fs.readFileSync("config.js", "utf8"), eol = cfgSrc.includes("\r\n") ? "\r\n" : "\n";
const CFG = new Function("window", cfgSrc + "\n;return window.CFG")({});
(async () => {
  let rows = null;
  try {
    const r = await fetch(CFG.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/route_pages?active=eq.true&order=sort,id", {headers: {apikey: CFG.SUPABASE_ANON_KEY, Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY}});
    if (!r.ok) throw new Error(r.status + " " + (await r.text()).slice(0, 200));
    rows = await r.json()
  } catch (e) {
    console.warn("sync.js: не удалось получить направления из базы (" + e.message + "). Берётся прежний routes.db.json.");
    try { rows = JSON.parse(fs.readFileSync("routes.db.json", "utf8")) } catch (e2) { rows = [] }
  }
  fs.writeFileSync("routes.db.json", JSON.stringify(rows, null, 2) + "\n");
  /* страницы для config.js: те, которых там ещё нет (вне блока DB-PAGES) */
  const base = cfgSrc.replace(new RegExp("\\r?\\n?" + BEGIN.replace(/[*/]/g, "\\$&") + "[\\s\\S]*?" + END.replace(/[*/]/g, "\\$&") + "\\r?\\n?"), eol);
  const have = new Set(new Function("window", base + "\n;return window.CFG.PAGES")({}).map(p => p.href));
  const pages = rows.filter(p => !have.has(p.file)).map(p => `    {href: ${JSON.stringify(p.file)}, title: ${JSON.stringify(p.from_name + " → " + p.to_name)}, route: ${JSON.stringify(p.route)}${p.kind === "slice" ? ", slice: true" : ""}}`);
  const blk = BEGIN + " (создаётся командой node sync.js из админки, руками не править)*/" + eol + (pages.length ? "window.CFG.PAGES.push(" + eol + pages.join("," + eol) + eol + ");" : "/* пока пусто */") + eol + END + eol;
  fs.writeFileSync("config.js", base.replace(/\s*$/, eol) + blk);
  console.log("sync.js: направлений из админки: " + rows.length + " (в config.js добавлено страниц: " + pages.length + ")");
  require("./build.js")
})();

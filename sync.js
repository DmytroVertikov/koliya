/* Колія: node sync.js
   1) забирает направления из админки (Supabase, таблица route_pages: все записи, включая выключенные) → routes.db.json
   2) обновляет в config.js блок DB-PAGES: список страниц для главной и страниц направлений берётся из базы (записи базы заменяют одноимённые страницы
      из PAGES, выключенные убираются, новые добавляются; порядок — по полю sort)
   3) запускает сборку build.js
   Вместо прежнего «node build.js» теперь запускать «node sync.js». Если база недоступна, берётся прежний routes.db.json.
   Нужен Node 18+ (встроенный fetch). */
const fs = require("fs");
const BEGIN = "/*DB-PAGES:BEGIN", END = "/*DB-PAGES:END*/";
const cfgSrc = fs.readFileSync("config.js", "utf8"), eol = cfgSrc.includes("\r\n") ? "\r\n" : "\n";
const CFG = new Function("window", cfgSrc + "\n;return window.CFG")({});
const esc = t => t.replace(/[*/]/g, "\\$&");
(async () => {
  let rows = null;
  try {
    const r = await fetch(CFG.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/route_pages?order=sort,id", {headers: {apikey: CFG.SUPABASE_ANON_KEY, Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY}});
    if (!r.ok) throw new Error(r.status + " " + (await r.text()).slice(0, 200));
    rows = await r.json()
  } catch (e) {
    console.warn("sync.js: не удалось получить направления из базы (" + e.message + "). Берётся прежний routes.db.json.");
    try { rows = JSON.parse(fs.readFileSync("routes.db.json", "utf8")) } catch (e2) { rows = [] }
  }
  fs.writeFileSync("routes.db.json", JSON.stringify(rows, null, 2) + "\n");
  const base = cfgSrc.replace(new RegExp("\\r?\\n?" + esc(BEGIN) + "[\\s\\S]*?" + esc(END) + "\\r?\\n?"), eol);
  const act = rows.filter(p => p.active !== false), all = rows.map(p => p.file);
  const pages = act.map(p => `    {href: ${JSON.stringify(p.file)}, title: ${JSON.stringify(p.from_name + " → " + p.to_name)}, route: ${JSON.stringify(p.route)}${(p.kind === "slice" || (p.extra || {}).slice) ? ", slice: true" : ""}}`);
  const blk = BEGIN + " (создаётся командой node sync.js из админки, руками не править)*/" + eol +
    (rows.length ? "window.CFG.PAGES = window.CFG.PAGES.filter(function (p) { return " + JSON.stringify(all) + ".indexOf(p.href) < 0 }).concat([" + eol + pages.join("," + eol) + eol + "]);" : "/* пока пусто */") + eol + END + eol;
  fs.writeFileSync("config.js", base.replace(/\s*$/, eol) + blk);
  console.log("sync.js: записей в базе: " + rows.length + ", показывается страниц: " + act.length);
  require("./build.js")
})();

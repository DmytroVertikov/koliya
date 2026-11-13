/* Колія: node sync.js
   1) забирает из админки (Supabase): направления (таблица route_pages, все записи, включая выключенные, вместе с их текстами) → routes.db.json;
      тексты интерфейса (ui_texts) и станции с переводами (stations) → i18n.db.json
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
  /* переводы: ui_texts + stations. Если какой-то таблицы ещё нет или база недоступна, остаётся прежний снимок i18n.db.json */
  const get = async p => {
    let out = [], off = 0;
    for (;;) { /* Supabase отдаёт максимум 1000 строк за запрос */
      const r = await fetch(CFG.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + p + "&limit=1000&offset=" + off, {headers: {apikey: CFG.SUPABASE_ANON_KEY, Authorization: "Bearer " + CFG.SUPABASE_ANON_KEY}});
      if (!r.ok) throw new Error(p.split("?")[0] + ": " + r.status + " " + (await r.text()).slice(0, 200));
      const part = await r.json(); out = out.concat(part);
      if (part.length < 1000) return out;
      off += 1000
    }
  };
  try {
    const ui = await get("ui_texts?select=key,ru,uk,en,pl&order=key"), stations = await get("stations?select=name_ru,name_uk,name_en,name_pl,in_ru,in_uk,in_pl,aliases&order=name_ru");
    if (!ui.length) throw new Error("ui_texts пуста: выполните i18n.sql в Supabase");
    fs.writeFileSync("i18n.db.json", JSON.stringify({ui, stations}, null, 1) + "\n");
    console.log("sync.js: текстов интерфейса: " + ui.length + ", станций: " + stations.length)
  } catch (e) {
    console.warn("sync.js: не удалось получить переводы из базы (" + e.message + "). Берётся прежний i18n.db.json.")
  }
  const base = cfgSrc.replace(new RegExp("\\r?\\n?" + esc(BEGIN) + "[\\s\\S]*?" + esc(END) + "\\r?\\n?"), eol);
  const act = rows.filter(p => p.active !== false), all = rows.map(p => p.file);
  const pages = act.map(p => `    {href: ${JSON.stringify(p.file)}, title: ${JSON.stringify(p.from_name + " → " + p.to_name)}, route: ${JSON.stringify(p.route)}${(p.kind === "slice" || (p.extra || {}).slice) ? ", slice: true" : ""}}`);
  const blk = BEGIN + " (создаётся командой node sync.js из админки, руками не править)*/" + eol +
    (rows.length ? "window.CFG.PAGES = window.CFG.PAGES.filter(function (p) { return " + JSON.stringify(all) + ".indexOf(p.href) < 0 }).concat([" + eol + pages.join("," + eol) + eol + "]);" : "/* пока пусто */") + eol + END + eol;
  fs.writeFileSync("config.js", base.replace(/\s*$/, eol) + blk);
  console.log("sync.js: записей в базе: " + rows.length + ", показывается страниц: " + act.length);
  require("./build.js")
})();

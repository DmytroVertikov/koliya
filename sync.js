/* Колія: node sync.js
   1) забирает из админки (Supabase): направления (таблица route_pages, все записи, включая выключенные, вместе с их текстами) → routes.db.json;
      тексты интерфейса (ui_texts), станции с переводами (stations) страны (countries) и пометки поездов (trains.badge) → i18n.db.json
   2) запускает сборку build.js
   Вместо прежнего «node build.js» теперь запускать «node sync.js». Если база недоступна, берётся прежний routes.db.json.
   Нужен Node 18+ (встроенный fetch). */
const fs = require("fs");
const CFG = new Function("window", fs.readFileSync("config.js", "utf8") + "\n;return window.CFG")({});
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
    const trains = await get("trains?select=number,badge&badge=not.is.null&order=number"), countries = await get("countries?select=slug,name,flag,sort&order=sort,slug"), ui = await get("ui_texts?select=key,ru,uk,en,pl&order=key"), stations = await get("stations?select=name_ru,name_uk,name_en,name_pl,in_ru,in_uk,in_pl,aliases&order=name_ru");
    if (!ui.length) throw new Error("ui_texts пуста: выполните i18n.sql в Supabase");
    fs.writeFileSync("i18n.db.json", JSON.stringify({ui, stations, countries, trains}, null, 1) + "\n");
    console.log("sync.js: текстов интерфейса: " + ui.length + ", станций: " + stations.length)
  } catch (e) {
    console.warn("sync.js: не удалось получить переводы из базы (" + e.message + "). Берётся прежний i18n.db.json.")
  }
  console.log("sync.js: записей в базе: " + rows.length + ", показывается страниц: " + rows.filter(p => p.active !== false).length);
  require("./build.js")
})();

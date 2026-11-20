/* Колія: node sync.js
   1) забирает из админки (Supabase): направления (таблица route_pages, все записи, включая выключенные, вместе с их текстами) → routes.db.json;
      тексты интерфейса (ui_texts), станции с переводами (stations) страны (countries) пометки поездов (trains.badge) и ссылки главной (home_links) → i18n.db.json
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
    const home_links = await get("home_links?select=kind,sort,label_ru,label_uk,label_en,label_pl,url&active=eq.true&order=kind,sort,id"), trains = await get("trains?select=number,badge&badge=not.is.null&order=number"), countries = await get("countries?select=slug,name,flag,sort&order=sort,slug"), ui = await get("ui_texts?select=key,ru,uk,en,pl&order=key"), stations = (await get("stations?select=*&order=name_ru")).map(s => ({name_ru: s.name_ru, name_uk: s.name_uk, name_en: s.name_en, name_pl: s.name_pl, in_ru: s.in_ru, in_uk: s.in_uk, in_pl: s.in_pl, short_ru: s.short_ru || null, short_uk: s.short_uk || null, short_en: s.short_en || null, short_pl: s.short_pl || null, aliases: s.aliases}));
    if (!ui.length) throw new Error("ui_texts пуста: выполните i18n.sql в Supabase");
    let meta = {}; /* дата обновления для подвала: последнее изменение любых данных (варианты маршрутов, страницы направлений, тексты); таблица без updated_at пропускается */
    {
      let m = ""; /* ISO-даты одного формата сравниваются как строки */
      for (const t of ["options", "route_pages", "ui_texts"]) {
        try { const o = await get(t + "?select=updated_at&updated_at=not.is.null&order=updated_at.desc&limit=1"); if (o.length && o[0].updated_at > m) m = o[0].updated_at } catch (e) { /* нет таблицы или колонки (db/updated-at.sql): пропускаем */ }
      }
      if (m) meta.updated = m; else { try { meta = JSON.parse(fs.readFileSync("i18n.db.json", "utf8")).meta || {} } catch (e2) { } }
    }
    fs.writeFileSync("i18n.db.json", JSON.stringify({ui, stations, countries, trains, home_links, meta}, null, 1) + "\n");
    console.log("sync.js: текстов интерфейса: " + ui.length + ", станций: " + stations.length)
  } catch (e) {
    console.warn("sync.js: не удалось получить переводы из базы (" + e.message + "). Берётся прежний i18n.db.json.")
  }
  /* варианты маршрутов (options): снимок options.db.json нужен сборке, чтобы карточки лежали в HTML (их видят поисковики). Нет базы — остаётся прежний снимок */
  try {
    const opts = await get("options?select=*&order=sort");
    if (!opts.length) throw new Error("options пуста");
    fs.writeFileSync("options.db.json", JSON.stringify(opts, null, 1) + "\n");
    console.log("sync.js: вариантов маршрутов: " + opts.length)
  } catch (e) {
    console.warn("sync.js: не удалось получить варианты из базы (" + e.message + "). Берётся прежний options.db.json (если есть).")
  }
  console.log("sync.js: записей в базе: " + rows.length + ", показывается страниц: " + rows.filter(p => p.active !== false).length);
  require("./build.js")
})();

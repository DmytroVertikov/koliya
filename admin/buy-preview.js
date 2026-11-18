/* Предпросмотр блока «Как купить билеты» в админке.
   Блок собирает настоящий build.js: он запускается прямо в браузере на ещё не сохранённых настройках страницы, а «файлы» ему
   подсовывает подставная файловая система в памяти (ничего не записывается на диск и в базу). Поэтому предпросмотр
   не расходится с сайтом: любая правка в build.js или в шаблоне route.src.html сразу видна и здесь.
   Тексты — из базы (ui_texts, актуальные), станции и страны — из снимка i18n.db.json (обновляется кнопкой «Пересобрать сайт»). */
const BuyPreview = (() => {
    const STOP = {stop: true};
    let pre = null, texts = null, textsAt = 0, getTexts = null;

    async function text(url) { const r = await fetch(url, {cache: "no-cache"}); if (!r.ok) throw new Error(url + ": " + r.status); return r.text() }
    /* build.js, шаблон страницы и снимок данных читаем один раз за сеанс */
    async function load() {
        if (pre) return pre;
        const [build, tpl, cfg, db] = await Promise.all(["../build.js", "../route.src.html", "../config.js", "../i18n.db.json"].map(text));
        return pre = {build, tpl, cfg, db: JSON.parse(db)}
    }
    /* актуальные тексты из ui_texts (не чаще раза в 30 секунд); нет доступа — берётся снимок */
    async function liveTexts() {
        if (!getTexts) return null;
        if (texts && Date.now() - textsAt < 30000) return texts;
        try { texts = await getTexts(); textsAt = Date.now() } catch (e) { texts = null }
        return texts
    }

    /* routes — строки таблицы route_pages (редактируемая страница + страницы, на тексты которых она ссылается) */
    function build(P, ui, routes) {
        const db = Object.assign({}, P.db, ui ? {ui} : {}), files = {}, warns = [];
        const fs = {
            readFileSync(n) {
                n = String(n).replace(/^.*\//, "");
                if (n === "routes.db.json") return JSON.stringify(routes);
                if (n === "i18n.db.json") return JSON.stringify(db);
                if (n === "route.src.html") return P.tpl;
                if (n === "config.js") return P.cfg;
                if (n === "index.src.html") throw STOP; /* страницы маршрутов уже собраны; главная для предпросмотра не нужна */
                if (n === "style.css" || n === "common.js") return ""; /* нужны только для версии ?v= */
                throw new Error("нет файла " + n)
            },
            writeFileSync(n, c) { files[n] = c },
            mkdirSync() {}
        };
        const crypto = {createHash() { const h = {update() { return h }, digest() { return "preview0" }}; return h }};
        const req = m => { if (m === "fs") return fs; if (m === "crypto") return crypto; throw new Error("require(" + m + ")") };
        const con = {log() {}, error() {}, warn(m) { if (/^нет ключа/.test(m)) warns.push(String(m).replace(/^нет ключа\s*/, "")) }};
        try { new Function("require", "__dirname", "console", P.build)(req, "", con) } catch (e) { if (e !== STOP) throw e }
        return {files, warns}
    }

    const attrs = s => s.replace(/<script[\s\S]*?<\/script>/g, "");
    /* из готовой страницы берём блок покупки (он лежит в странице как шаблон BUY) и оформление шапки */
    function extract(files, file, lang) {
        const ru = files[file], page = files[(lang === "ru" ? "" : lang + "/") + file];
        if (!ru || !page) throw new Error("страница не собралась: проверьте, что страница включена и заполнены «откуда» и «куда»");
        const m = page.match(/const BUY = `([\s\S]*?<\/section>)`;/);
        if (!m) throw new Error("в странице нет блока покупки");
        const head = attrs((ru.match(/<head>([\s\S]*?)<\/head>/) || [0, ""])[1]).replace(/<base[^>]*>/g, "");
        return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><base href="../">${head}<style>body{margin:0;padding:12px 0 8px}</style></head><body><main class="wrap">${m[1]}</main></body></html>`
    }

    /* row — строка route_pages с текущими значениями формы; all — все строки (для страниц, на тексты которых ссылается эта) */
    async function render(row, all, lang) {
        const P = await load(), ui = await liveTexts(), need = new Set([row.like_id, "kw", "wk"].filter(Boolean));
        const routes = (all || []).filter(x => need.has(x.id) && x.id !== row.id).concat([Object.assign({}, row, {active: true})]);
        const {files, warns} = build(P, ui, routes);
        return {html: extract(files, row.file, lang || "ru"), warns}
    }
    return {render, init(o) { getTexts = o && o.texts }}
})();

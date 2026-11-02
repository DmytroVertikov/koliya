/* Колія: общий код сайта и админки.
   Формат варианта маршрута (одна строка в базе):
   @ Киев 19:29 > Варшава 10:24 ; 14 ч 55 мин ; 1 пересадка || 019: Киев 19:29 > Хелм 05:00 || IC 12010: *Хелм 06:34 > Люблин 07:44 > *Варшава Центральная 10:15
   · «@ …» шапка карточки, задаётся вручную: откуда > куда ; в пути (необязательно) ; плашка (необязательно)
   · дальше поезда через «||»; станции через «>»; звёздочка * перед станцией = выделить крупным шрифтом
   · старый формат без «@» тоже работает: шапка берётся из первой и последней станции, выделены первая и последняя */
const U = ((window.CFG && CFG.SUPABASE_URL) || "").replace(/\/$/, ""), K = (window.CFG && CFG.SUPABASE_ANON_KEY) || "";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[c]));
const safeUrl = u => {
    u = String(u || "").trim();
    return /^https?:\/\//i.test(u) ? u : "#"
};

/* i18n: язык страницы задаёт window.LANG (ru по умолчанию), словари лежат в i18n.js (подключать до common.js) */
const LG = window.LANG || "ru", TR = (window.I18N && I18N[LG]) || {};
const t = (k, v) => String(TR[k] != null ? TR[k] : (window.I18N && I18N.ru && I18N.ru[k] != null ? I18N.ru[k] : k)).replace(/\{(\w+)\}/g, (m, x) => v && v[x] != null ? v[x] : m);
const stn = n => {
    const s = (window.I18N && I18N.ST || {})[String(n || "").trim()], i = {uk: 0, en: 1, pl: 2}[LG];
    if (i == null) return n;
    if (s && s[i]) return s[i];
    if (n && window.console) console.info("i18n: нет перевода станции «" + n + "» (" + LG + ")");
    return n
};
const t_no = () => t("no");
const trRoute = x => String(x).split(" → ").map(stn).join(" → ");
const toMin = t => {
    const m = String(t || "").match(/(\d{1,2}):(\d{2})/);
    return m ? (+m[1]) * 60 + (+m[2]) : null
};

function autoDur(a, b) {
    const x = toMin(a), y = toMin(b);
    if (x == null || y == null) return "";
    const d = ((y - x) % 1440 + 1440) % 1440, h = Math.floor(d / 60), m = d % 60;
    return (h ? h + " " + t("h") : "") + (h && m ? " " : "") + (m ? m + " " + t("min") : "") || "0 " + t("min")
}

const autoTag = n => n < 1 ? t("tag0") : n == 1 ? t("tag1") : n < 5 ? t("tag2", {n}) : t("tag5", {n});

function splitStop(x) {
    x = String(x).trim();
    let hl = false;
    if (x[0] === "*") {
        hl = true;
        x = x.slice(1).trim()
    }
    const m = x.match(/^([\s\S]*?)\s*(\d{1,2}:\d{2}[\s\S]*)$/);
    return m ? {name: m[1].trim(), time: m[2].trim(), hl} : {name: x, time: "", hl}
}

function deriveHead(legs) {
    const f = legs[0] && legs[0].stops[0],
        l = legs.length && legs[legs.length - 1].stops[legs[legs.length - 1].stops.length - 1];
    return {from: f ? f.name : "", ft: f ? f.time : "", to: l ? l.name : "", tt: l ? l.time : "", dur: "", tag: ""}
}

function parseOption(dsl) {
    const parts = String(dsl || "").split("||").map(s => s.trim()).filter(Boolean);
    let head = null;
    if (parts.length && parts[0][0] === "@") {
        const h = parts.shift().slice(1).split(";"), r = h[0].split(">"), a = splitStop(r[0] || ""),
            b = splitStop(r[1] || "");
        head = {from: a.name, ft: a.time, to: b.name, tt: b.time, dur: (h[1] || "").trim(), tag: (h[2] || "").trim()}
    }
    const legs = parts.map(p => {
        const m = p.match(/^([^>]*?):\s([\s\S]*)$/), stops = (m ? m[2] : p).split(">").map(splitStop);
        if (!head && !stops.some(s => s.hl)) stops.forEach((s, i) => s.hl = i === 0 || i === stops.length - 1);
        return {train: m ? m[1].trim() : "", stops}
    });
    return {head, legs}
}

function serializeOption(o) {
    const j = (n, t) => ((n || "").trim() + " " + (t || "").trim()).trim(), h = o.head || {};
    const hs = "@ " + j(h.from, h.ft) + " > " + j(h.to, h.tt) + ((h.dur || h.tag) ? " ; " + (h.dur || "").trim() : "") + (h.tag ? " ; " + h.tag.trim() : "");
    return [hs].concat((o.legs || []).map(L => (L.train || "").trim() + ": " + L.stops.map(s => (s.hl ? "*" : "") + j(s.name, s.time)).join(" > "))).join("||")
}

function validateOption(o) {
    const e = [], h = o.head || {}, bad = /[>|*;]/, tm = /^\d{1,2}:\d{2}/;
    if (!(h.from || "").trim()) e.push("Шапка: укажите, откуда");
    if (!(h.to || "").trim()) e.push("Шапка: укажите, куда");
    if (bad.test((h.from || "") + (h.to || ""))) e.push("Шапка: в названиях нельзя > | * ;");
    if (!tm.test((h.ft || "").trim())) e.push("Шапка: время отправления вида 19:29");
    if (!tm.test((h.tt || "").trim())) e.push("Шапка: время прибытия вида 10:24");
    if (/[|;]/.test((h.dur || "") + (h.tag || ""))) e.push("Шапка: в «в пути» и плашке нельзя | ;");
    if (!(o.legs || []).length) e.push("Добавьте хотя бы один поезд");
    (o.legs || []).forEach((L, i) => {
        const n = "Поезд " + (i + 1) + ": ";
        if (!(L.train || "").trim()) e.push(n + "укажите номер поезда");
        if (/[:>|*;]/.test(L.train || "")) e.push(n + "в номере нельзя : > | * ;");
        if (L.stops.length < 2) e.push(n + "нужно минимум 2 станции");
        L.stops.forEach((s, k) => {
            if (!s.name.trim()) e.push(n + "станция " + (k + 1) + " без названия");
            if (bad.test(s.name)) e.push(n + "в названии станции нельзя > | * ;");
            if (!tm.test(s.time.trim())) e.push(n + "станция " + (k + 1) + ": время вида 19:06")
        })
    });
    return e
}

/* совместимость со старым кодом */
function parseDsl(t) {
    const p = parseOption(t);
    if (!p.legs.length) throw new Error("Пустой маршрут");
    return p.legs.map(L => ({train: L.train, st: L.stops.map(s => [s.name, s.time])}))
}

/* «в Хелме»: предложный падеж для односложных названий; для составных вернёт "" и плашка покажет «Пересадка: Название» */
const CITY_IN = {"Хелм": "в Хелме", "Перемышль": "в Перемышле", "Чоп": "в Чопе", "Жешув": "в Жешуве", "Люблин": "в Люблине", "Варшава": "в Варшаве", "Краков": "в Кракове", "Львов": "во Львове", "Киев": "в Киеве", "Ясиня": "в Ясине", "Мостиска": "в Мостисках", "Медика": "в Медике", "Дорогуск": "в Дорогуске"};

function inCity(n) {
    n = String(n || "").trim();
    const e = (window.I18N && I18N.ST || {})[n];
    if (LG === "en") return e ? "in " + e[1] : "";
    const k = {ru: 3, uk: 4, pl: 5}[LG];
    if (e && e[k]) return e[k];
    if (LG !== "ru") return "";
    if (CITY_IN[n]) return CITY_IN[n];
    if (!/^[А-Яа-яЁёІіЇїЄє'’-]+$/.test(n)) return "";
    const l = n.slice(-1);
    if (/[бвгдзклмнпрстфхцчшщ]/i.test(l)) return "в " + n + "е";
    if (l === "ь" || l === "а") return "в " + n.slice(0, -1) + "е";
    return ""
}

/* Единый формат названия поезда: УЗ → «№019К», «№0230»; польские с буквенным префиксом → «IC 21010» */
function trainName(t) {
    t = String(t || "").trim().replace(/^№\s*/, "").replace(/\s+/g, " ");
    if (!t) return "";
    const m = t.match(/^([A-Za-z]+)\s*(\d.*)$/);
    return m ? m[1].toUpperCase() + " " + m[2].toUpperCase() : t_no() + t.toUpperCase()
}

/* Пометки у поездов: ключ подписи в i18n → номера поездов. Номер пишется кириллической «К», регистр, пробелы и ведущие нули не важны */
const TRAIN_BADGES = {
    seat: ["705К", "706Л", "715К", "716Л"], /* сидячий интерсити */
    odd:  ["070О"],           // по нечётным числам
    even: ["070К"]            // по чётным числам
};
const trainKey = n => String(n || "").toUpperCase().replace(/[\s№]/g, "").replace(/K/g, "К").replace(/^0+/, "");
const trainBadges = n => Object.keys(TRAIN_BADGES).filter(k => TRAIN_BADGES[k].some(x => trainKey(x) === trainKey(n)));
const badgesHtml = n => trainBadges(n).map(k => `<span class="tb ${k}">${k === "seat" ? "💺" : "📅"} ${esc(t(k))}</span>`).join("");

function optHtml(o) {
    let p;
    try {
        p = parseOption(o.dsl)
    } catch (e) {
        return ""
    }
    const legs = p.legs;
    if (!legs.length) return "";
    const h = p.head || deriveHead(legs), n = legs.length - 1, dur = h.dur || autoDur(h.ft, h.tt),
        tag = h.tag || autoTag(n);
    const board = `<div class="board"><div class="pt"><time>${esc(h.ft)}</time><span>${esc(stn(h.from))}</span></div><div class="mid">${dur ? `<span class="dur">${esc(dur)}</span>` : ""}<span class="loc">${esc(t("loc"))}</span><span class="line"></span><span class="tag${n > 0 ? " x" : ""}">${esc(tag)}</span></div><div class="pt end"><time>${esc(h.tt)}</time><span>${esc(stn(h.to))}</span></div></div>`;
    const body = legs.map((L, i) => {
        let sw = "";
        if (i) {
            const pa = legs[i - 1].stops[legs[i - 1].stops.length - 1], a = pa.name, b = L.stops[0].name;
            const wait = autoDur(pa.time, L.stops[0].time);
            const where = b && b !== a ? t("swapArr", {a: stn(a), b: stn(b)}) : (inCity(a) ? t("swapIn", {c: inCity(a)}) : t("swap", {a: stn(a)}));
            sw = `<div class="swap">🔁 ${esc(where)}${wait ? " · " + esc(wait) : ""}</div>`
        }
        return sw + `<div class="leg"><h4>🚆 ${esc(t("train"))} ${esc(trainName(L.train))}${badgesHtml(L.train)}</h4><ul class="tl">${L.stops.map(s => `<li class="${s.hl ? "h" : "m"}"><span>${esc(stn(s.name))}</span><time>${esc(s.time)}</time></li>`).join("")}</ul></div>`
    }).join("");
    return `<article class="opt">${board}<div class="perf"></div><div class="body">${body}${o.note ? `<div class="note">${esc(o.note)}</div>` : ""}</div></article>`
}

/* Общий футер: правится здесь, подключается на всех страницах, где есть <footer id="site-footer"> */
const FOOTER_HTML = () => `<div class="fcols">
<div><b>🚆 Колія</b><p>${t("f1")}</p></div>
<div><b>${t("f2h")}</b>
<p>${t("f2a")}</p>
<p>${t("f2b")}</p>
<p>${t("f2c")}</p></div>
<div><b>${t("f3h")}</b><p>${t("f3")}</p></div></div>
<p class="fine">${t("fsrc")} <a href="https://uz.gov.ua/">uz.gov.ua</a> · <a href="https://intercity.pl/">intercity.pl</a> · © ${new Date().getFullYear()} Колія</p>`;
(function () {
    const f = document.getElementById("site-footer");
    if (f) f.innerHTML = FOOTER_HTML()
})();
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

/* i18n: язык страницы задаёт window.LANG (ru по умолчанию), словари лежат в dict/<язык>.js, их создаёт build.js из базы (подключать до common.js) */
const LG = window.LANG || "ru", TR = (window.I18N && I18N[LG]) || {};
const t = (k, v) => String(TR[k] != null ? TR[k] : (window.I18N && I18N.ru && I18N.ru[k] != null ? I18N.ru[k] : k)).replace(/\{(\w+)\}/g, (m, x) => v && v[x] != null ? v[x] : m);
const stn = n => {
    const s = (window.I18N && I18N.ST || {})[String(n || "").trim()], i = {uk: 0, en: 1, pl: 2}[LG];
    if (i == null) return n;
    if (s && s[i]) return s[i];
    if (n && window.console) console.info("i18n: нет перевода станции «" + n + "» (" + LG + ")");
    return n
};
/* короткое название станции для заголовка карточки (в «Подробнее» остаются полные); нет короткого — обычное название */
const stnShort = n => {
    const s = (window.I18N && I18N.ST || {})[String(n || "").trim()], i = {ru: 6, uk: 7, en: 8, pl: 9}[LG];
    return s && i != null && s[i] ? s[i] : stn(n)
};
const t_no = () => t("no");
const trRoute = x => String(x).split(" → ").map(stn).join(" → ");
/* то же с короткими названиями — для ссылок и заголовков, где важна компактность (главная, «Другие направления») */
const trRouteShort = x => String(x).split(" → ").map(stnShort).join(" → ");
const toMin = t => {
    const m = String(t || "").match(/(\d{1,2}):(\d{2})/);
    return m ? (+m[1]) * 60 + (+m[2]) : null
};

/* в строке времени станции может быть одно время или два («прибытие – отправление») */
const timesOf = raw => String(raw || "").match(/\d{1,2}:\d{2}/g) || [];
const arrOf = raw => timesOf(raw)[0] || "";
const depOf = raw => { const a = timesOf(raw); return a[a.length - 1] || "" };

const fmtDur = d => {
    const h = Math.floor(d / 60), m = d % 60;
    return (h ? h + " " + t("h") : "") + (h && m ? " " : "") + (m ? m + " " + t("min") : "") || "0 " + t("min")
};

/* между двумя временами «как на табло»: до 24 ч (сутки теряются, годится для пересадки) */
function autoDur(a, b) {
    const x = toMin(a), y = toMin(b);
    if (x == null || y == null) return "";
    return fmtDur(((y - x) % 1440 + 1440) % 1440)
}

/* Часовой пояс станции: Украина, Румыния, Молдова — UTC+2, Польша, Венгрия, Словакия, Австрия, Чехия, Германия — UTC+1 (переходы на летнее время у них совпадают).
   Списки — начала русских названий в нижнем регистре. Станция вне списков берёт пояс ближайшей известной станции того же поезда
   (поезд идёт по одной стране, пока не пересечёт границу), а если известных нет совсем — считается украинской (UTC+2). */
const CET_STATIONS = ["варшав", "хелм", "люблин", "перемышль", "пшемысль", "жешув", "краков", "щецин", "познан", "зелена", "свиноуй", "вроцлав", "гданьск", "катовиц", "лодзь", "белосток", "дорогуск", "медика", "кошице", "прага", "братислав", "берлин", "дрезден",
    "будапешт", "захонь", "ньиредьхаза", "дебрецен", "сольнок", "цеглед", "ферихедь", "кебанья", "татабанья", "дьер", "мошонмадьяр", "хедьешхалом", "мишкольц", "сегед", "печ", "секешфехервар", "эстергом", "шопрон", "сомбатхей", "залаэгерсег", "ньираддьярмат", "кишварда", "хидашнемети", "чеп",
    "вена", "линц", "зальцбург", "инсбрук", "грац", "санкт-пёльтен", "санкт-пельтен", "вельс", "амштеттен", "хатван", "дьёндьёш", "ньиредь"];
const EET_STATIONS = ["киев", "чоп", "мукачево", "ужгород", "львов", "харьков", "одесс", "днепр", "ковел", "ровно", "тернопол", "хмельницк", "винниц", "ивано-франковск", "черновц", "запорож", "кременчуг", "полтав", "сумы", "чернигов", "житомир", "луцк", "коломы", "стрый", "самбор", "сколе", "ворохта", "рахов", "воловец", "королево", "батево", "виноградов", "лавочн", "яремч", "бровар", "фастов", "бердичев", "жмеринк", "калинов", "знаменк", "кропивницк", "николаев", "херсон", "кишин", "унген", "яссы", "сучав", "бухарест", "кластер", "дьюла"];
const tzKnown = n => {
    n = String(n || "").trim().toLowerCase();
    return CET_STATIONS.some(p => n.startsWith(p)) ? 1 : EET_STATIONS.some(p => n.startsWith(p)) ? 2 : null
};

/* полное время в пути: каждое «местное» время переводим на общую шкалу (местное − пояс) и идём по станциям вперёд — до ближайшего такого же времени позже предыдущего
   (так учитываются сутки и более, пояс меняется на границе прямо по ходу поезда, а ожидание на пересадке входит в итог).
   Считаем до станции прибытия из шапки (поезд может идти дальше). Предполагается, что между соседними станциями проходит меньше суток. */
function legsDur(legs, head) {
    const st = [];
    (legs || []).forEach((L, li) => {
        const part = [];
        let nh = 0; /* у первой выделенной станции поезда (посадка) считаем отправление, у остальных — прибытие */
        const sp = legSpan(L.stops); /* только участок поездки: остановки до посадки и после выхода (поезд идёт раньше/дальше) в счёт не идут, иначе они сбивают цепочку времени и набегают лишние сутки */
        L.stops.slice(sp.ib, sp.ie + 1).forEach(s => {
            const m = toMin(s.hl && nh === 0 ? depOf(s.time) : arrOf(s.time));
            if (s.hl) nh++;
            if (m != null) part.push({m, name: s.name, li, tz: tzKnown(s.name)})
        });
        /* неизвестный пояс — от ближайшей известной станции этого поезда */
        part.forEach((p, k) => {
            if (p.tz != null) return;
            let best = null, bd = 1e9;
            part.forEach((q, n) => { if (q.tz != null && Math.abs(n - k) < bd) { bd = Math.abs(n - k); best = q.tz } });
            p.tz = best != null ? best : 2
        });
        st.push(...part)
    });
    if (st.length < 2) return "";
    const last = legs.length - 1, nm = v => String(v || "").trim().toLowerCase();
    /* первая и последняя станции из шапки: поезд может начинаться раньше и идти дальше, их остановки не считаются */
    const find = (li, time, name) => {
        const t = time == null ? null : toMin(time);
        if (t == null) return -1;
        const ok = (s, byName) => s.li === li && s.m === t && (!byName || !nm(name) || nm(s.name).startsWith(nm(name)));
        let k = st.findIndex(s => ok(s, true));
        if (k < 0) k = st.findIndex(s => ok(s, false));
        return k
    };
    let b = head ? find(0, head.ft, head.from) : -1, e = head ? find(last, head.tt, head.to) : -1;
    if (b < 0) b = 0;
    if (e <= b) e = st.length - 1;
    if (e <= b) return "";
    let prev = null;
    st.forEach(s => {
        const u = s.m - s.tz * 60;
        s.abs = prev == null ? u : u + Math.ceil((prev - u) / 1440) * 1440;
        prev = s.abs
    });
    const sum = st[e].abs - st[b].abs;
    return sum > 0 ? fmtDur(sum) : ""
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
    const f = legs[0] && legs[0].stops[legSpan(legs[0].stops).ib],
        l = legs.length && legs[legs.length - 1].stops[legSpan(legs[legs.length - 1].stops).ie];
    return {from: f ? f.name : "", ft: f ? depOf(f.time) : "", to: l ? l.name : "", tt: l ? arrOf(l.time) : "", dur: "", tag: ""}
}

/* периодичность — свободный текст (пусто = ежедневно); частые фразы переводятся, остальное показывается как введено */
const freqTxt = f => {
    f = String(f || "").trim();
    const x = f.toLowerCase().replace(/ё/g, "е");
    if (!f || /^ежедневно$/.test(x)) return t("d.daily");
    if (/^по нечетным( (дням|числам|датам))?$/.test(x)) return t("d.odd");
    if (/^по четным( (дням|числам|датам))?$/.test(x)) return t("d.even");
    return f
};

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
        const tr = (m ? m[1] : "").split("~");
        return {train: tr[0].trim(), freq: (tr[1] || "").trim(), stops}
    });
    return {head, legs}
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

/* Пометки у поездов (seat / odd / even → номера поездов) приходят из базы (trains.badge): на сайте через pages.js (CFG.TRAIN_BADGES), в админке из списка поездов.
   Буква в номере кириллическая; латинские K и O тоже сработают, регистр, пробелы и ведущие нули не важны. */
const ICON = {seat: "💺", odd: "📅", even: "📅"};
const trainKey = n => String(n || "").toUpperCase().replace(/[\s№]/g, "").replace(/K/g, "К").replace(/O/g, "О").replace(/^0+/, "");
const trainBadges = n => { const B = (window.CFG && CFG.TRAIN_BADGES) || {}; return Object.keys(B).sort().reverse().filter(k => ICON[k] && B[k].some(x => trainKey(x) === trainKey(n))) }; /* порядок: seat, odd, even */
/* у поезда с пометкой «по нечётным/чётным» периодичность берётся из неё, даже если в базе указано «ежедневно» */
const isDaily = f => !String(f || "").trim() || /^ежедневно$/.test(String(f).trim().toLowerCase());
const oddEven = L => isDaily(L.freq) ? trainBadges(L.train).find(k => k === "odd" || k === "even") : "";
/* в заголовке поезда периодичность не дублируем, если она совпадает с пометкой «по чётным/нечётным» */
const hideFq = L => { const k = trainBadges(L.train).find(k => k === "odd" || k === "even"); return !!k && (isDaily(L.freq) || freqTxt(L.freq) === t("d." + k)) };
/* в сводке карточки — первая «особая» периодичность среди всех поездов маршрута (не только первого) */
const sumFreq = legs => {
    for (const L of legs) { if (!isDaily(L.freq)) return freqTxt(L.freq); const k = oddEven(L); if (k) return t(k) }
    return freqTxt(legs[0].freq)
};
const badgesHtml = n => trainBadges(n).map(k => `<span class="tb ${k}">${ICON[k]} ${esc(t(k))}</span>`).join("");

const hm = s => (String(s).match(/\d{1,2}:\d{2}/) || [""])[0];

/* Остановка в маршруте: если в строке времени два разных значения («00:20 – 00:23»), это прибытие и отправление —
   показываем их двумя строками и считаем стоянку. Одно время (или оба одинаковые) — как раньше, одной строкой. */
const TL_LBL = {
    ru: ["прибытие", "отправление"], uk: ["прибуття", "відправлення"],
    en: ["arrival", "departure"], pl: ["przyjazd", "odjazd"]
};
const tlLbl = () => TL_LBL[LG] || TL_LBL.ru;
const tlTimes = raw => {
    const m = timesOf(raw);
    return m.length >= 2 && m[0] !== m[m.length - 1] ? {a: m[0], d: m[m.length - 1]} : null
};
const TL_KEY = {
    ru: "Время: сверху — прибытие, снизу — отправление", uk: "Час: зверху — прибуття, знизу — відправлення",
    en: "Times: arrival on top, departure below", pl: "Godziny: u góry przyjazd, niżej odjazd"
};
/* поезд показывается весь, а «свой» участок (от посадки до выхода) — между первой и последней выделенной станцией */
const legSpan = stops => {
    const ih = stops.map((s, i) => s.hl ? i : -1).filter(i => i >= 0);
    return ih.length ? {ib: ih[0], ie: ih[ih.length - 1]} : {ib: 0, ie: stops.length - 1}
};
const tlStop = (s, extra) => {
    const x = tlTimes(s.time), cls = (s.hl ? "h" : "m") + (extra ? " " + extra : "");
    if (!x) return `<li class="${cls}"><span>${esc(stn(s.name))}</span><time>${esc(s.time)}</time></li>`;
    const ma = toMin(x.a), md = toMin(x.d), dw = ma != null && md != null ? ((md - ma) % 1440 + 1440) % 1440 : 0, L = tlLbl();
    return `<li class="${cls} two"><span>${esc(stn(s.name))}${dw ? `<small class="dw">${esc(fmtDur(dw))}</small>` : ""}</span>` +
        `<time><b class="ta" title="${esc(L[0])}">${esc(x.a)}</b><b class="td" title="${esc(L[1])}">${esc(x.d)}</b></time></li>`
};
const TL_OUT = {
    ru: "серым — станции вне вашей поездки", uk: "сірим — станції поза вашою поїздкою",
    en: "grey — stops outside your ride", pl: "szare — stacje poza Twoją podróżą"
};
const tlKey = stops => {
    const sp = legSpan(stops), out = sp.ib > 0 || sp.ie < stops.length - 1, two = stops.some(s => tlTimes(s.time));
    if (!two && !out) return "";
    const parts = [];
    if (two) parts.push(TL_KEY[LG] || TL_KEY.ru);
    if (out) parts.push(TL_OUT[LG] || TL_OUT.ru);
    return `<p class="tl-key">${esc(parts.join(" · "))}</p>`
};

/* Карточка варианта: сворачиваемая (<details>), в сводке — время, длительность, пересадки; в раскрытой части — поезда и станции */
function optHtml(o) {
    let p;
    try {
        p = parseOption(o.dsl)
    } catch (e) {
        return ""
    }
    const legs = p.legs;
    if (!legs.length) return "";
    const h = p.head || deriveHead(legs), n = legs.length - 1, dur = h.dur || legsDur(legs, h) || autoDur(h.ft, h.tt),
        tag = h.tag || autoTag(n), isD = n === 0;
    /* swaps[i] — пересадка перед поездом i */
    const swaps = legs.map((L, i) => {
        if (!i) return null;
        const ps = legs[i - 1].stops, pa = ps[legSpan(ps).ie], nb = L.stops[legSpan(L.stops).ib], a = pa.name, b = nb.name;
        const where = b && b !== a ? t("swapArr", {a: stn(a), b: stn(b)}) : (inCity(a) ? t("swapIn", {c: inCity(a)}) : t("swap", {a: stn(a)}));
        return {where, wait: autoDur(arrOf(pa.time), depOf(nb.time)), t1: arrOf(pa.time), t2: depOf(nb.time)}
    });
    const trains = legs.map(L => trainName(L.train)).filter(Boolean).join(" + ");
    const badge = isD ? `<span class="bd">✓ ${esc(t("direct.h"))}</span>` : `<span class="bd">⇄ ${esc(tag)}</span>`;
    const xfs = swaps.filter(Boolean).map(s => `<div class="xf"><span class="xi" aria-hidden="true">⇄</span><div><b>${esc(s.where)}</b>${s.wait ? `<small>${esc(s.wait)}${s.t1 && s.t2 ? " (" + esc(s.t1) + " – " + esc(s.t2) + ")" : ""}</small>` : ""}</div></div>`).join("");
    const head = `<summary class="oc"><div class="oc-main"><div class="oc-top">${badge}<span class="oc-tr">${esc(trains)}</span><span class="oc-fq">🗓 ${esc(sumFreq(legs))}</span></div>` +
        `<div class="oc-row"><div class="pt"><time>${esc(h.ft)}</time><span>${esc(stnShort(h.from))}</span></div>` +
        `<div class="mid"><span class="line"></span>${dur ? `<span class="dur">${esc(dur)}</span>` : ""}<span class="loc">${esc(t("loc"))}</span></div>` +
        `<div class="pt end"><time>${esc(h.tt)}</time><span>${esc(stnShort(h.to))}</span></div></div></div>` +
        `<div class="oc-side">${isD ? `<span class="nc">✓ ${esc(t("d.nochg"))}</span>` : `<div class="xfs">${xfs}</div>`}<span class="more"><span class="t-more">${esc(t("d.more"))}</span><span class="t-less">${esc(t("d.less"))}</span><i class="chev"></i></span></div></summary>`;
    const body = legs.map((L, i) => {
        const s = swaps[i + 1], sw = s ? `<div class="swap">🔁 ${esc(s.where)}${s.wait ? " · " + esc(s.wait) : ""}</div>` : "";
        return `<div class="stp"><div class="leg"><h4>🚆 ${esc(t("train"))} ${esc(trainName(L.train))}${badgesHtml(L.train)}${hideFq(L) ? "" : `<small class="fq">🗓 ${esc(freqTxt(L.freq))}</small>`}</h4>${tlKey(L.stops)}<ul class="tl">${(sp => L.stops.map((s, k) => tlStop(s, k < sp.ib || k > sp.ie ? "out" : k === sp.ie && k < L.stops.length - 1 ? "ie" : "")).join(""))(legSpan(L.stops))}</ul></div>${sw}</div>`
    }).join("");
    return `<details class="opt oc-card ${isD ? "is-d" : "is-x"}${n > 1 ? " is-x2" : ""}">${head}<div class="body">${body}${o.note ? `<div class="note">${esc(o.note)}</div>` : ""}</div></details>`
}

/* Общий футер: правится здесь, подключается на всех страницах, где есть <footer id="site-footer"> */
const FOOT_SRC = [["Укрзалізниця", "https://uz.gov.ua/"], ["PKP Intercity", "https://intercity.pl/"], ["RegioJet", "https://regiojet.cz/"], ["České dráhy", "https://www.cd.cz/"], ["ZSSK", "https://www.zssk.sk/"], ["MÁV", "https://jegy.mav.hu/"], ["ÖBB", "https://www.oebb.at/"], ["CFR Călători", "https://www.cfrcalatori.ro/"], ["Deutsche Bahn", "https://www.bahn.de/"]];
/* дата обновления информации: по умолчанию как в тексте, затем уточняется по последнему изменению вариантов в базе */
const footDate = (txt, date) => /\{date\}/.test(txt) ? txt.replace(/\{date\}/g, `<time class="fdate">${date}</time>`) : txt.replace(/\d{1,2}\.\d{1,2}\.\d{4}/, `<time class="fdate">${date}</time>`);
const fmtDate = x => new Intl.DateTimeFormat("ru-RU", {day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Kyiv"}).format(x);
const FOOTER_HTML = () => `<div class="fcols">
<div><b>🚆 Колія</b><p>${t("f1")}</p></div>
<div><b>${t("f2h")}</b>
<p>${t("f2a")}</p>
<p>${footDate(t("f2b"), fmtDate(new Date()))}</p>
<p>${t("f2c")}</p></div>
<div><b>${t("f3h")}</b><p>${t("f3")}</p></div></div>
<div class="fbar"><div class="fsrc"><span class="fsl">${t("f.src")}</span><ul class="fchips">${FOOT_SRC.map(x => `<li><a href="${x[1]}" target="_blank" rel="noopener">${x[0]}</a></li>`).join("")}</ul></div>
<div class="flow"><span>© ${new Date().getFullYear()} Колія</span><button type="button" class="fb-link" data-fb="other">${t("fb.link")}</button></div></div>`;
(function () {
    const f = document.getElementById("site-footer");
    if (!f) return;
    f.innerHTML = FOOTER_HTML();
    /* дата обновления = последнее изменение вариантов в базе */
    const el = f.querySelector(".fdate");
    if (el && U && K) fetch(U + "/rest/v1/options?select=updated_at&updated_at=not.is.null&order=updated_at.desc&limit=1", {headers: {apikey: K, Authorization: "Bearer " + K}}).then(r => r.ok ? r.json() : []).then(a => { const d = a[0] && new Date(a[0].updated_at); if (d && !isNaN(d)) el.textContent = fmtDate(d) }).catch(() => { })
})();

/* Обратная связь: окно <dialog> открывается любой кнопкой с data-fb="<тема>" (data / idea / question / other).
   Сообщение уходит в таблицу feedback (db/feedback-1.sql): анонимный посетитель может только добавить строку.
   Тексты — ключи fb.* (по умолчанию в build.js, правятся в админке → «Тексты»). Страница и язык подставляются сами.
   На страницах маршрутов под блоком «Ещё маршруты» добавляются оценка «Информация помогла? 👍 / 👎» (db/feedback-2.sql) и ссылка «Нашли неточность?». */
(() => {
    const KINDS = ["data", "idea", "question", "other"], GAP = 15000;
    let dlg, sentAt = 0;
    /* отправка одной строки в feedback; тема: data / idea / question / other (форма) или up / down (оценка страницы) */
    const post = async (kind, message, contact) => {
        if (!U || !K) throw new Error("no config");
        const r = await fetch(U + "/rest/v1/feedback", {
            method: "POST",
            headers: {apikey: K, Authorization: "Bearer " + K, "Content-Type": "application/json", Prefer: "return=minimal"},
            body: JSON.stringify({kind, message, contact: contact || "", page: (location.pathname + location.hash).slice(0, 300), lang: LG})
        });
        if (!r.ok) throw new Error(r.status)
    };
    const make = () => {
        dlg = document.createElement("dialog");
        dlg.className = "fb";
        dlg.setAttribute("aria-labelledby", "fb-h");
        dlg.innerHTML = `<form novalidate><h2 id="fb-h">${esc(t("fb.title"))}</h2>
<label for="fb-kind">${esc(t("fb.kind"))}</label><select id="fb-kind" name="kind">${KINDS.map(k => `<option value="${k}">${esc(t("fb.k." + k))}</option>`).join("")}</select>
<label for="fb-msg">${esc(t("fb.msg"))}</label><textarea id="fb-msg" name="message" maxlength="2000" rows="5" placeholder="${esc(t("fb.msg.ph"))}"></textarea>
<label for="fb-contact">${esc(t("fb.contact"))}</label><input id="fb-contact" name="contact" type="text" maxlength="200" autocomplete="email" placeholder="${esc(t("fb.contact.ph"))}">
<div class="fb-hp" aria-hidden="true"><label>Website <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
<p class="fb-note">${esc(t("fb.privacy"))}</p>
<p class="fb-msg" role="status" aria-live="polite"></p>
<div class="fb-row"><button type="submit" class="btn pri">${esc(t("fb.send"))}</button><button type="button" class="btn" data-close>${esc(t("fb.cancel"))}</button></div></form>`;
        document.body.appendChild(dlg);
        const form = dlg.querySelector("form"), msg = dlg.querySelector(".fb-msg"), go = form.querySelector('[type="submit"]');
        const say = (txt, bad) => { msg.textContent = txt; msg.classList.toggle("err", !!bad) };
        dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close() });
        form.addEventListener("submit", async e => {
            e.preventDefault();
            const f = form.elements, text = f.message.value.trim();
            if (f.website.value) { say(t("fb.thanks")); return } /* поле-приманка заполнил бот: делаем вид, что всё хорошо */
            if (text.length < 5) { say(t("fb.short"), true); return }
            if (Date.now() - sentAt < GAP) { say(t("fb.wait"), true); return }
            go.disabled = true; say("…");
            try {
                await post(f.kind.value, text, f.contact.value.trim());
                sentAt = Date.now();
                f.message.value = "";
                say(t("fb.thanks"))
            } catch (err) { say(t("fb.err"), true) }
            go.disabled = false
        })
    };
    const open = kind => {
        if (!dlg) make();
        dlg.querySelector("#fb-kind").value = KINDS.includes(kind) ? kind : "other";
        dlg.querySelector(".fb-msg").textContent = "";
        dlg.showModal();
        dlg.querySelector("#fb-msg").focus()
    };
    document.addEventListener("click", e => {
        const b = e.target.closest("[data-fb]");
        if (b && typeof HTMLDialogElement === "function") { e.preventDefault(); open(b.dataset.fb) }
    });
    /* оценка страницы «Информация помогла?»: 👍 уходит сразу, 👎 раскрывает поле «Что не так?»; одна оценка на страницу в браузере */
    const rateKey = "fb-rate:" + location.pathname;
    const voted = () => { try { return !!localStorage.getItem(rateKey) } catch (e) { return false } };
    const mark = () => { try { localStorage.setItem(rateKey, "1") } catch (e) {} };
    const rateHtml = () => voted()
        ? `<p class="fb-rate-done">${esc(t("fb.rate.thanks"))}</p>`
        : `<div class="fb-rate"><span>${esc(t("fb.rate"))}</span><button type="button" data-rate="up">👍 ${esc(t("fb.yes"))}</button><button type="button" data-rate="down">👎 ${esc(t("fb.no"))}</button></div>
<form class="fb-down" hidden><label for="fb-down-t">${esc(t("fb.down.h"))}</label><textarea id="fb-down-t" maxlength="2000" rows="3" placeholder="${esc(t("fb.down.ph"))}"></textarea><button type="submit" class="btn pri">${esc(t("fb.send"))}</button></form>`;
    const rate = async (box, kind, text) => {
        try {
            await post(kind, text);
            mark();
            box.querySelector(".fb-rate-wrap").innerHTML = `<p class="fb-rate-done">${esc(t("fb.rate.thanks"))}</p>`
        } catch (e) {
            const m = box.querySelector(".fb-rate-err"); if (m) m.textContent = t("fb.err")
        }
    };
    const ask = () => {
        const more = document.getElementById("more");
        if (!more || document.querySelector(".fb-ask")) return;
        more.insertAdjacentHTML("afterend", `<section class="fb-ask"><div class="fb-rate-wrap">${rateHtml()}</div><p class="fb-rate-err" role="status"></p><p><button type="button" data-fb="data">⚠️ ${esc(t("fb.report"))}</button></p></section>`);
        const box = document.querySelector(".fb-ask");
        box.addEventListener("click", e => {
            const b = e.target.closest("[data-rate]");
            if (!b) return;
            if (b.dataset.rate === "up") rate(box, "up", "");
            else { const f = box.querySelector(".fb-down"); f.hidden = false; f.querySelector("textarea").focus() }
        });
        const f = box.querySelector(".fb-down");
        if (f) f.addEventListener("submit", e => { e.preventDefault(); rate(box, "down", f.querySelector("textarea").value.trim()) })
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ask); else ask()
})();

/* Колія: сворачивание списка станций поезда.
   Если станций, которые можно спрятать, больше трёх, по умолчанию видны только выделенные (.h: посадка, пересадка, выход).
   Остальные (промежуточные и станции вне вашей поездки) прячутся за кнопкой «Показать все станции».
   Если их три или меньше, список показывается целиком.
   Если выделенных нет, остаются первая и последняя станции.
   Модуль не зависит от рендера карточек: он следит за DOM и обрабатывает каждый .tl один раз. */
(() => {
    const TXT = {
        ru: ["Показать все станции", "Скрыть станции"],
        uk: ["Показати всі станції", "Сховати станції"],
        en: ["Show all stations", "Hide stations"],
        pl: ["Pokaż wszystkie stacje", "Ukryj stacje"]
    };
    const [MORE, LESS] = TXT[window.LANG] || TXT.ru;
    const MAX_PLAIN = 3; /* сворачиваем, только если скрываемых станций больше трёх */

    function fold(ul) {
        if (ul.dataset.fold) return;
        ul.dataset.fold = "1";
        const items = [...ul.children].filter(el => el.tagName === "LI");

        const hasH = items.some(li => li.classList.contains("h")), last = items.length - 1;
        const keep = items.map((li, i) => hasH ? li.classList.contains("h") : i === 0 || i === last);
        const kept = items.filter((_, i) => keep[i]);
        const hidden = items.length - kept.length;
        if (hidden <= MAX_PLAIN || !kept.length) return;

        items.forEach((li, i) => { if (!keep[i]) li.classList.add("f-hide"); });
        /* рельса: у крайних видимых станций линия идёт только внутрь списка */
        kept[0].classList.add("f-first");
        kept[kept.length - 1].classList.add("f-last");

        /* скрытые участки: строка-кнопка ставится на каждый участок между видимыми станциями;
           если таких нет (скрыты только крайние), то на первый скрытый участок */
        const runs = [];
        items.forEach((li, i) => {
            if (keep[i]) return;
            if (i > 0 && !keep[i - 1]) return;
            runs.push({li, inner: items.slice(0, i).some((_, j) => keep[j]) && items.slice(i).some((_, j) => keep[i + j])});
        });
        const rows = runs.filter(r => r.inner);
        (rows.length ? rows : runs.slice(0, 1)).forEach(({li}) => {
            const row = document.createElement("li");
            row.className = "fold";
            row.innerHTML = `<span><button type="button" class="fold-btn" aria-expanded="false">${MORE} (${hidden})</button></span>`;
            li.before(row);
        });

        const less = document.createElement("button");
        less.type = "button";
        less.className = "fold-less";
        less.textContent = LESS;
        less.hidden = true;
        ul.after(less);
        ul.classList.add("folded");

        const set = open => {
            ul.classList.toggle("folded", !open);
            less.hidden = !open;
            ul.querySelectorAll(".fold-btn").forEach(b => b.setAttribute("aria-expanded", String(open)));
            if (!open) (ul.closest(".leg") || ul).scrollIntoView({block: "nearest"});
        };
        ul.addEventListener("click", e => { if (e.target.closest(".fold-btn")) set(true); });
        less.addEventListener("click", () => set(false));
    }

    const run = () => document.querySelectorAll(".tl").forEach(fold);
    new MutationObserver(run).observe(document.documentElement, {childList: true, subtree: true});
    run();
})();

/* Блок «Ещё маршруты» на страницах маршрутов: обратное направление, другие направления из того же города, другие маршруты в тот же город.
   Пары городов берутся из CFG.PAGES (title «Откуда → Куда»), страница определяется по имени файла.
   Тексты приходят из шаблона (словарь ui_texts: more.h, more.rev, more.from, more.to, more.dir, more.all); «%s» в них заменяется названием города.
   Вызов: document.getElementById("more").innerHTML = BUY + moreRoutes({...}) */
function moreRoutes(o) {
    o = Object.assign({h: "Ещё маршруты", rev: "Обратное направление", from: "Другие направления из города %s", to: "Другие маршруты в город %s", dir: "Все маршруты этого направления", all: "Все страны", home: "./"}, o);
    const n = s => String(s || "").trim().toLowerCase(),
        pages = (window.CFG && CFG.PAGES) || [],
        here = location.pathname.split("/").pop() || "index.html",
        cur = pages.find(p => p.href === here) || {},
        [a, b] = cur.title ? String(cur.title).split(" → ") : [window.FROM, window.TO],
        [f0, t0] = [n(a), n(b)],
        ends = p => String(p.title).split(" → ").map(n),
        part = (p, i) => esc(stnShort(String(p.title).split(" → ")[i])),
        chip = (p, html) => `<a class="chip" href="${esc(p.href)}" title="${esc(trRoute(p.title))}">${html}</a>`,
        group = (h, arr) => arr.length ? `<div class="dir-group"><h3>${h}</h3><div class="chips">${arr.join("")}</div></div>` : "",
        others = pages.filter(p => p.href !== here),
        reverse = others.filter(p => ends(p)[0] === t0 && ends(p)[1] === f0),
        sameFrom = others.filter(p => ends(p)[0] === f0 && ends(p)[1] !== t0),
        sameTo = others.filter(p => ends(p)[1] === t0 && ends(p)[0] !== f0),
        hash = o.hash || cur.route;
    return `<section class="panel" id="routes"><h2>${o.h}</h2>`
        + group(o.rev, reverse.map(p => chip(p, "🔄 " + esc(trRouteShort(p.title)))))
        + group(o.from.replace("%s", () => esc(stnShort(a))), sameFrom.map(p => chip(p, `<span class="ar">→</span>${part(p, 1)}`)))
        + group(o.to.replace("%s", () => esc(stnShort(b))), sameTo.map(p => chip(p, `${part(p, 0)}<span class="ar"> →</span>`)))
        + `<div class="grid" style="margin-top:16px">${hash ? `<a class="btn" href="${o.home}#${esc(hash)}">${o.dir}</a>` : ""}<a class="btn" href="${o.home}">${o.all}</a></div></section>`
}

/* Карточки вариантов страницы маршрута. Одна и та же функция работает в браузере (route.src.html) и при сборке (build.js: готовый HTML
   попадает в страницу, чтобы поисковики видели расписание без JS). all — строки таблицы options, C — настройки страницы (CARDS в шаблоне).
   Возвращает {list, html}: list — подходящие варианты, html — содержимое блока #app. */
/* Данные для разметки schema.org: каждый поезд из показанных вариантов — TrainTrip (станции посадки/выхода, время, номер поезда).
   Время местное, как в расписании; даты нет, потому что расписание не привязано к дню. */
function tripsLd(list) {
    const seen = new Set(), out = [], hms = s => String(s).match(/\d{1,2}:\d{2}/g) || [], pad = h => h.replace(/^(\d):/, "0$1:");
    list.forEach(x => x.p.legs.forEach(L => {
        const sp = legSpan(L.stops), a = L.stops[sp.ib], b = L.stops[sp.ie], dt = hms(a.time).pop(), at = hms(b.time)[0];
        if (!a || !b || a === b || !dt || !at) return;
        const key = trainKey(L.train) + "|" + dt + ">" + at + "|" + a.name + ">" + b.name;
        if (seen.has(key)) return;
        seen.add(key);
        const trip = {"@type": "TrainTrip", departureStation: {"@type": "TrainStation", name: stn(a.name)}, arrivalStation: {"@type": "TrainStation", name: stn(b.name)}, departureTime: pad(dt), arrivalTime: pad(at)};
        if (L.train) trip.trainNumber = String(L.train).trim().replace(/^№\s*/, "");
        out.push(trip)
    }));
    return out.slice(0, 30)
}

function renderCards(all, C) {
    const norm = s => String(s || "").trim().toLowerCase(), HIDE = (C.HIDE || []).map(norm), FROM = C.FROM, TO = C.TO;
    const rows = all.filter(o => o.active !== false).map(o => {
        const p = parseOption(o.dsl);
        return {o, p, h: p.head || deriveHead(p.legs)}
    }).filter(x => x.p.legs.length);
    /* SLICE: страница «A → B» без своих вариантов в базе: поезда берутся из поездов других вариантов (участок от A до B по остановкам поезда) */
    const hm = s => (String(s).match(/\d{1,2}:\d{2}/) || [""])[0];
    const sliced = () => {
        const seen = new Set(), out = [];
        rows.forEach(x => x.p.legs.forEach(L => {
            if (HIDE.includes(norm(L.train))) return;
            const st = L.stops, a = st.findIndex(s => norm(s.name).startsWith(norm(FROM)));
            if (a < 0) return;
            const b = st.findIndex((s, i) => i > a && norm(s.name).startsWith(norm(TO)));
            if (b < 0) return;
            const key = norm(L.train) + "|" + hm(st[a].time) + ">" + hm(st[b].time);
            if (seen.has(key)) return;
            seen.add(key);
            /* поезд показывается целиком (от начальной до конечной станции), выделены только «откуда» и «куда» страницы */
            const fq = L.freq && !/^ежедневно$/i.test(L.freq.trim()) ? " ~ " + L.freq.trim() : "",
                dsl = L.train.trim() + fq + ": " + st.map((s, i) => (i === a || i === b ? "*" : "") + (s.name + " " + s.time).trim()).join(" > "),
                o = {dsl, updated_at: x.o.updated_at, active: true}, p = parseOption(dsl);
            out.push({o, p, h: deriveHead(p.legs)})
        }));
        return out
    };
    const mins = x => (m => m ? m[1] * 60 + +m[2] : 1e4)(String(x.h.ft).match(/(\d{1,2}):(\d{2})/));
    /* всегда по времени отправления; одинаковое время сохраняет порядок из базы */
    const list = (C.SLICE ? sliced() : rows.filter(x => norm(x.h.from).startsWith(norm(FROM)) && norm(x.h.to).startsWith(norm(TO)))).sort((a, b) => mins(a) - mins(b));
    const direct = C.HAS_DIRECT ? list.filter(x => x.p.legs.length === 1) : [], transfer = C.HAS_DIRECT ? list.filter(x => x.p.legs.length > 1) : list;
    if (!list.length) return {list, html: `<div class="panel"><h2>${C.noH}</h2><p>${C.noP}</p></div>`};
    const SPLIT = C.SPLIT || [];
    const html = (direct.length ? `<h2 class="sub" style="margin-top:6px">${C.dh} <small>${C.ds}</small></h2><div class="direct direct-wrap" style="margin-top:16px">${direct.map(x => optHtml(x.o)).join("")}</div>` : "")
        + (direct.length && transfer.length ? `<aside class="ad wide" data-slot="mid" hidden></aside>` : "")
        + (() => {
            /* все варианты с пересадкой — одним списком (по времени отправления), без подзаголовков по станциям */
            if (!transfer.length) return "";
            const at = x => { const s = x.p.legs[0].stops; return norm(s[s.length - 1].name) }; /* станция первой пересадки */
            const bf = x => !SPLIT.length || SPLIT.some(s => s[1] && at(x).startsWith(norm(s[0]))); /* пограничный контроль — по карточке */
            const cards = transfer.map(x => { const c = optHtml(x.o); return bf(x) ? c.replace("<details ", '<details data-b="1" ') : c }).join("");
            const head = direct.length ? `<h2 class="sub">${C.th}</h2>` : "";
            return head + `<div class="cols${transfer.length === 1 ? " one" : ""}" style="margin-top:${head ? 16 : 6}px">${cards}</div>`
        })() + (C.HAS_BUY ? `<a class="howbar" href="#buy"><span class="hi" aria-hidden="true">i</span><span><b>${C.howq}</b><small>${C.hows}</small></span><span class="go">${C.how} →</span></a>` : "");
    return {list, html, ld: tripsLd(list)}
}

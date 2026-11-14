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
const t_no = () => t("no");
const trRoute = x => String(x).split(" → ").map(stn).join(" → ");
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
const tzOf = n => tzKnown(n) || 2;

/* полное время в пути: каждое «местное» время переводим на общую шкалу (местное − пояс) и идём по станциям вперёд — до ближайшего такого же времени позже предыдущего
   (так учитываются сутки и более, пояс меняется на границе прямо по ходу поезда, а ожидание на пересадке входит в итог).
   Считаем до станции прибытия из шапки (поезд может идти дальше). Предполагается, что между соседними станциями проходит меньше суток. */
function legsDur(legs, head) {
    const st = [];
    (legs || []).forEach((L, li) => {
        const part = [];
        let nh = 0; /* у первой выделенной станции поезда (посадка) считаем отправление, у остальных — прибытие */
        L.stops.forEach(s => {
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

function serializeOption(o) {
    const j = (n, t) => ((n || "").trim() + " " + (t || "").trim()).trim(), h = o.head || {};
    const hs = "@ " + j(h.from, h.ft) + " > " + j(h.to, h.tt) + ((h.dur || h.tag) ? " ; " + (h.dur || "").trim() : "") + (h.tag ? " ; " + h.tag.trim() : "");
    return [hs].concat((o.legs || []).map(L => (L.train || "").trim() + ((L.freq || "").trim() && !/^ежедневно$/i.test(L.freq.trim()) ? " ~ " + L.freq.trim() : "") + ": " + L.stops.map(s => (s.hl ? "*" : "") + j(s.name, s.time)).join(" > "))).join("||")
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
        if (/[:>|*;~]/.test(L.train || "")) e.push(n + "в номере нельзя : > | * ; ~");
        if (/[:>|*;~]/.test(L.freq || "")) e.push(n + "в периодичности нельзя : > | * ; ~");
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
const legFreq = L => { const k = oddEven(L); return k ? t(k) : freqTxt(L.freq) };
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
        `<div class="oc-row"><div class="pt"><time>${esc(h.ft)}</time><span>${esc(stn(h.from))}</span></div>` +
        `<div class="mid"><span class="line"></span>${dur ? `<span class="dur">${esc(dur)}</span>` : ""}<span class="loc">${esc(t("loc"))}</span></div>` +
        `<div class="pt end"><time>${esc(h.tt)}</time><span>${esc(stn(h.to))}</span></div></div></div>` +
        `<div class="oc-side">${isD ? `<span class="nc">✓ ${esc(t("d.nochg"))}</span>` : `<div class="xfs">${xfs}</div>`}<span class="more"><span class="t-more">${esc(t("d.more"))}</span><span class="t-less">${esc(t("d.less"))}</span><i class="chev"></i></span></div></summary>`;
    const body = legs.map((L, i) => {
        const s = swaps[i + 1], sw = s ? `<div class="swap">🔁 ${esc(s.where)}${s.wait ? " · " + esc(s.wait) : ""}</div>` : "";
        return `<div class="stp"><div class="leg"><h4>🚆 ${esc(t("train"))} ${esc(trainName(L.train))}${badgesHtml(L.train)}${hideFq(L) ? "" : `<small class="fq">🗓 ${esc(freqTxt(L.freq))}</small>`}</h4>${tlKey(L.stops)}<ul class="tl">${(sp => L.stops.map((s, k) => tlStop(s, k < sp.ib || k > sp.ie ? "out" : k === sp.ie && k < L.stops.length - 1 ? "ie" : "")).join(""))(legSpan(L.stops))}</ul></div>${sw}</div>`
    }).join("");
    return `<details class="opt oc-card ${isD ? "is-d" : "is-x"}${n > 1 ? " is-x2" : ""}">${head}<div class="body">${body}${o.note ? `<div class="note">${esc(o.note)}</div>` : ""}</div></details>`
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
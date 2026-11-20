/* Согласие на cookie статистики (Google Analytics). Включается, только если в config.js задан GA_ID (например "G-XXXXXXXXXX").
   Без GA_ID скрипт ничего не делает: баннера и ссылки «Настройки cookie» нет, так как нечего разрешать.
   До согласия Google Analytics не загружается вообще. Выбор хранится в localStorage на 12 месяцев; изменить его можно ссылкой в подвале.
   Если на сайт добавится реклама (AdSense), для посетителей из ЕС и Великобритании нужен сертифицированный Google баннер согласия (CMP):
   этот простой баннер для рекламы не подходит. Тогда вместо него подключают CMP из AdSense. */
(function () {
    var C = window.CFG || {}, ID = C.GA_ID;
    if (!ID || !/^G-[A-Z0-9]+$/.test(ID)) return;
    var L = window.LANG || "ru", KEY = "koliya-consent", YEAR = 365 * 864e5;
    var TX = {
        ru: {t: "Cookie и статистика", p: "Мы используем Google Analytics, чтобы понимать, какие маршруты нужны посетителям. Он включится только с вашего согласия.", a: "Принять", r: "Отклонить", m: "Подробнее", s: "Настройки cookie"},
        uk: {t: "Cookie та статистика", p: "Ми використовуємо Google Analytics, щоб розуміти, які маршрути потрібні відвідувачам. Він увімкнеться лише за вашою згодою.", a: "Прийняти", r: "Відхилити", m: "Докладніше", s: "Налаштування cookie"},
        en: {t: "Cookies and statistics", p: "We use Google Analytics to understand which routes visitors need. It is switched on only if you agree.", a: "Accept", r: "Decline", m: "Learn more", s: "Cookie settings"},
        pl: {t: "Cookie i statystyki", p: "Korzystamy z Google Analytics, aby wiedzieć, jakich tras szukają odwiedzający. Włączy się tylko za Twoją zgodą.", a: "Akceptuję", r: "Odrzucam", m: "Więcej", s: "Ustawienia cookie"}
    }, T = TX[L] || TX.ru;
    var read = function () {
        try { var o = JSON.parse(localStorage.getItem(KEY)); if (o && o.v === 1 && Date.now() - o.t < YEAR) return o } catch (e) {}
        return null
    };
    var save = function (a) { try { localStorage.setItem(KEY, JSON.stringify({v: 1, a: a, t: Date.now()})) } catch (e) {} };
    var loaded = false;
    var load = function () {
        window["ga-disable-" + ID] = false;
        if (loaded) return;
        loaded = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments) };
        gtag("consent", "default", {ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted"});
        gtag("js", new Date());
        gtag("config", ID);
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
        document.head.appendChild(s)
    };
    /* отказ или отзыв согласия: отключаем сбор и удаляем cookie _ga* */
    var revoke = function () {
        window["ga-disable-" + ID] = true;
        var host = location.hostname.split("."), doms = [location.hostname];
        for (var i = 1; i < host.length - 1; i++) doms.push("." + host.slice(i).join("."));
        document.cookie.split(";").forEach(function (c) {
            var n = c.split("=")[0].trim();
            if (n === "_ga" || n.indexOf("_ga_") === 0 || n === "_gid") doms.concat([""]).forEach(function (d) {
                document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "")
            })
        })
    };
    var bar = null;
    var close = function () { if (bar) { bar.remove(); bar = null } };
    var choose = function (a) { save(a); close(); a ? load() : revoke() };
    var show = function () {
        if (bar) return;
        bar = document.createElement("div");
        bar.className = "ckb";
        bar.setAttribute("role", "dialog");
        bar.setAttribute("aria-label", T.t);
        bar.innerHTML = '<div class="ckb-t"><b>' + T.t + "</b><p>" + T.p + ' <a href="privacy.html">' + T.m + '</a></p></div><div class="ckb-b"><button type="button" class="ckb-no">' + T.r + '</button><button type="button" class="ckb-yes">' + T.a + "</button></div>";
        bar.querySelector(".ckb-yes").onclick = function () { choose(true) };
        bar.querySelector(".ckb-no").onclick = function () { choose(false) };
        document.body.appendChild(bar)
    };
    var link = function () {
        var nav = document.querySelector("footer .flinks");
        if (!nav || nav.querySelector(".ckb-open")) return;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "fb-link ckb-open";
        b.textContent = T.s;
        b.onclick = show;
        nav.appendChild(b)
    };
    link();
    var s = read();
    if (!s) show(); else if (s.a) load(); else window["ga-disable-" + ID] = true
})();

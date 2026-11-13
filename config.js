// Supabase: Project Settings -> API. Anon key публичный, это нормально: доступ закрыт правилами RLS.
window.CFG = {
    SUPABASE_URL: "https://wnepdavtbeiamtosudfz.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXBkYXZ0YmVpYW10b3N1ZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTA3NjksImV4cCI6MjEwODk2Njc2OX0.eMSehg3H8BNdedgT4-qnvDafD8deBdoaSVBx7QRkSwo",
    // Список страниц маршрутов хранится в базе (таблица route_pages, админка → «Направления»).
    // Сайт получает его из pages.js (создаётся сборкой), админка — прямо из базы.
    pagesFromRows: function (rows) {
        return rows.filter(function (p) { return p.active !== false }).map(function (p) {
            var o = {href: p.file, title: p.from_name + " → " + p.to_name, route: p.route};
            if (p.kind === "slice" || (p.extra || {}).slice) o.slice = true;
            return o
        })
    }
};

// Supabase: Project Settings -> API. Anon key публичный, это нормально: доступ закрыт правилами RLS.
window.CFG = {
    SUPABASE_URL: "https://wnepdavtbeiamtosudfz.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXBkYXZ0YmVpYW10b3N1ZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzOTA3NjksImV4cCI6MjEwODk2Njc2OX0.eMSehg3H8BNdedgT4-qnvDafD8deBdoaSVBx7QRkSwo",
    // Одностраничники маршрутов: показываются на главной и на странице направления (route = код направления)
    PAGES: [
        {href: "kyiv-warsaw.html", title: "Киев → Варшава", route: "ua-pl"},
        {href: "warsaw-kyiv.html", title: "Варшава → Киев", route: "pl-ua"},
        {href: "kyiv-krakow.html", title: "Киев → Краков", route: "ua-pl"},
        {href: "krakow-kyiv.html", title: "Краков → Киев", route: "pl-ua"},
        {href: "dnipro-warsaw.html", title: "Днепр → Варшава", route: "ua-pl"},
        {href: "warsaw-dnipro.html", title: "Варшава → Днепр", route: "pl-ua"},
        {href: "dnipro-krakow.html", title: "Днепр → Краков", route: "ua-pl"},
        {href: "krakow-dnipro.html", title: "Краков → Днепр", route: "pl-ua"}
    ]
};

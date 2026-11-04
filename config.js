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
        {href: "krakow-dnipro.html", title: "Краков → Днепр", route: "pl-ua"},
        {href: "kharkiv-warsaw.html", title: "Харьков → Варшава", route: "ua-pl"},
        {href: "warsaw-kharkiv.html", title: "Варшава → Харьков", route: "pl-ua"},
        {href: "kharkiv-krakow.html", title: "Харьков → Краков", route: "ua-pl"},
        {href: "krakow-kharkiv.html", title: "Краков → Харьков", route: "pl-ua"},
        {href: "odesa-warsaw.html", title: "Одесса → Варшава", route: "ua-pl"},
        {href: "warsaw-odesa.html", title: "Варшава → Одесса", route: "pl-ua"},
        {href: "odesa-krakow.html", title: "Одесса → Краков", route: "ua-pl"},
        {href: "krakow-odesa.html", title: "Краков → Одесса", route: "pl-ua"},
        {href: "lviv-warsaw.html", title: "Львов → Варшава", route: "ua-pl"},
        {href: "warsaw-lviv.html", title: "Варшава → Львов", route: "pl-ua"},
        {href: "lviv-krakow.html", title: "Львов → Краков", route: "ua-pl"},
        {href: "krakow-lviv.html", title: "Краков → Львов", route: "pl-ua"},
        {href: "kremenchuk-warsaw.html", title: "Кременчуг → Варшава", route: "ua-pl"},
        {href: "warsaw-kremenchuk.html", title: "Варшава → Кременчуг", route: "pl-ua"},
        {href: "kremenchuk-krakow.html", title: "Кременчуг → Краков", route: "ua-pl"},
        {href: "krakow-kremenchuk.html", title: "Краков → Кременчуг", route: "pl-ua"},
        {href: "kyiv-bratislava.html", title: "Киев → Братислава", route: "ua-sk"},
        {href: "bratislava-kyiv.html", title: "Братислава → Киев", route: "sk-ua"},
        {href: "kyiv-bucharest.html", title: "Киев → Бухарест", route: "ua-ro"},
        {href: "bucharest-kyiv.html", title: "Бухарест → Киев", route: "ro-ua"}
    ]
};

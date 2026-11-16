// Supabase Edge Function «notify-feedback»: присылает в Telegram каждое новое обращение из формы на сайте.
// Её вызывает Database Webhook на INSERT в таблицу public.feedback (см. README.md рядом).
// Токен бота хранится только здесь (секрет), в браузер и в репозиторий не попадает.
//
// Секреты функции (Supabase → Edge Functions → Secrets):
//   TELEGRAM_BOT_TOKEN   токен бота от @BotFather
//   TELEGRAM_CHAT_ID     ваш chat id (число; для группы начинается с минуса)
//   WEBHOOK_SECRET       любая длинная случайная строка; та же строка указывается в заголовке x-webhook-secret у вебхука
//   SITE_URL             адрес сайта без пути, по умолчанию https://dmytrovertikov.github.io (в обращении путь страницы уже с /koliya)
// Деплой: supabase functions deploy notify-feedback --no-verify-jwt (вебхук проверяется своим секретом, а не JWT).

declare const Deno: any;

export interface Deps {
    fetch: typeof fetch;
    env(key: string): string | undefined;
}

const KINDS: Record<string, string> = {data: "Ошибка в данных", idea: "Предложение", question: "Вопрос", other: "Другое", up: "👍 Помогло", down: "👎 Не помогло"};

/* сравнение без утечки по времени */
function same(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let x = 0;
    for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return x === 0;
}

export function format(r: Record<string, unknown>, site: string): string {
    const s = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
    const kind = s(r.kind, 20);
    const lines = [`📬 ${KINDS[kind] || kind}${r.lang ? " · " + s(r.lang, 5).toUpperCase() : ""}`];
    if (s(r.message, 1)) lines.push("", s(r.message, 3000));
    lines.push("");
    if (s(r.contact, 1)) lines.push("Контакт: " + s(r.contact, 200));
    if (s(r.page, 1)) lines.push("Страница: " + site.replace(/\/$/, "") + s(r.page, 300));
    return lines.join("\n").slice(0, 4000);
}

export async function handle(req: Request, d: Deps): Promise<Response> {
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {status, headers: {"Content-Type": "application/json"}});
    if (req.method !== "POST") return json(405, {error: "Только POST"});

    const secret = d.env("WEBHOOK_SECRET");
    if (!secret) return json(500, {error: "На сервере не задан секрет WEBHOOK_SECRET"});
    if (!same(req.headers.get("x-webhook-secret") || "", secret)) return json(401, {error: "Неверный секрет"});

    let p: any;
    try { p = await req.json() } catch (e) { return json(400, {error: "Нужен JSON"}) }
    if (p?.type !== "INSERT" || p?.table !== "feedback" || !p.record) return json(200, {skipped: "не новое обращение"});
    if (p.record.kind === "up") return json(200, {skipped: "👍 без уведомления"});

    const token = d.env("TELEGRAM_BOT_TOKEN"), chat = d.env("TELEGRAM_CHAT_ID");
    if (!token || !chat) return json(500, {error: "Не заданы TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID"});
    const text = format(p.record, d.env("SITE_URL") || "https://dmytrovertikov.github.io");
    const r = await d.fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({chat_id: chat, text, disable_web_page_preview: true}),
    });
    if (!r.ok) return json(502, {error: "Telegram не принял сообщение", status: r.status});
    return json(200, {ok: true});
}

// запуск в Supabase (в тестах Deno нет, поэтому сервер не стартует)
if (typeof Deno !== "undefined" && Deno.serve) {
    Deno.serve((req: Request) => handle(req, {fetch, env: (k) => Deno.env.get(k)}));
}

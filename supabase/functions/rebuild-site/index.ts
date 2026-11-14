// Supabase Edge Function «rebuild-site»: кнопка «Пересобрать сайт» в админке запускает GitHub Actions (.github/workflows/rebuild.yml).
// Токен GitHub хранится только здесь (секрет GH_TOKEN) и в браузер не попадает.
//
// Секреты функции (Supabase → Edge Functions → Secrets):
//   GH_TOKEN       fine-grained токен GitHub: только репозиторий koliya, право Actions: Read and write (больше ничего)
//   ADMIN_EMAILS   (желательно) email админов через запятую; если задан, пересборку запускают только они, даже если в Auth появятся другие пользователи
//   GH_REPO        по умолчанию DmytroVertikov/koliya
//   GH_WORKFLOW    по умолчанию rebuild.yml
//   GH_REF         по умолчанию main
//   ALLOWED_ORIGINS  откуда разрешены запросы из браузера, через запятую; по умолчанию https://dmytrovertikov.github.io
// SUPABASE_URL и SUPABASE_ANON_KEY Supabase подставляет сам.

declare const Deno: any;

export interface Deps {
    getUser(token: string): Promise<{ email?: string } | null>;
    fetch: typeof fetch;
    env(key: string): string | undefined;
}

export async function handle(req: Request, d: Deps): Promise<Response> {
    const origins = (d.env("ALLOWED_ORIGINS") || "https://dmytrovertikov.github.io").split(",").map(s => s.trim()).filter(Boolean);
    const origin = req.headers.get("origin") || "";
    const cors: Record<string, string> = {
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin",
    };
    if (origins.includes(origin)) cors["Access-Control-Allow-Origin"] = origin;
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {status, headers: {...cors, "Content-Type": "application/json"}});

    if (req.method === "OPTIONS") return new Response(null, {status: 204, headers: cors});
    if (req.method !== "POST") return json(405, {error: "Только POST"});

    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return json(401, {error: "Нужен вход"});
    const user = await d.getUser(token).catch(() => null);
    if (!user) return json(401, {error: "Сессия недействительна, войдите снова"});

    const admins = (d.env("ADMIN_EMAILS") || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    if (admins.length && !admins.includes((user.email || "").toLowerCase())) return json(403, {error: "Нет прав на пересборку"});

    const gh = d.env("GH_TOKEN");
    if (!gh) return json(500, {error: "На сервере не задан секрет GH_TOKEN"});
    const repo = d.env("GH_REPO") || "DmytroVertikov/koliya", wf = d.env("GH_WORKFLOW") || "rebuild.yml", ref = d.env("GH_REF") || "main";
    const r = await d.fetch(`https://api.github.com/repos/${repo}/actions/workflows/${wf}/dispatches`, {
        method: "POST",
        headers: {Authorization: `Bearer ${gh}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "koliya-rebuild-site"},
        body: JSON.stringify({ref}),
    });
    if (r.status !== 204) return json(502, {error: "GitHub не принял запуск", status: r.status});
    return json(200, {ok: true});
}

// запуск в Supabase (в тестах Deno нет, поэтому сервер не стартует)
if (typeof Deno !== "undefined" && Deno.serve) {
    Deno.serve((req: Request) => handle(req, {
        getUser: async (token) => {
            const {createClient} = await import("https://esm.sh/@supabase/supabase-js@2.45.4");
            const c = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
            const {data, error} = await c.auth.getUser(token);
            return error || !data.user ? null : {email: data.user.email};
        },
        fetch,
        env: (k) => Deno.env.get(k),
    }));
}

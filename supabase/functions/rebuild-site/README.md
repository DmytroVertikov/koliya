# rebuild-site

Функция Supabase, которую вызывает кнопка «Пересобрать сайт» в админке. Она проверяет, что пользователь вошёл, и запускает GitHub Actions (`.github/workflows/rebuild.yml`: `node sync.js` и коммит результата). Токен GitHub хранится только в секретах функции.

## Что проверяет функция
1. Запрос пришёл с токеном вошедшего пользователя (публичный ключ сайта не подходит).
2. Если задан секрет `ADMIN_EMAILS`, пользователь есть в этом списке. Это защита на случай, если в Auth появится посторонний пользователь.
3. Только после этого вызывается GitHub.

## Секреты (Supabase → Edge Functions → Secrets)
| Секрет | Значение |
|---|---|
| `GH_TOKEN` | fine-grained токен GitHub: только репозиторий `koliya`, право **Actions: Read and write**, больше ничего |
| `ADMIN_EMAILS` | email админов через запятую (желательно задать) |
| `GH_REPO`, `GH_WORKFLOW`, `GH_REF`, `ALLOWED_ORIGINS` | необязательные: по умолчанию `DmytroVertikov/koliya`, `rebuild.yml`, `main`, `https://dmytrovertikov.github.io` |

## Развёртывание
Через панель: Edge Functions → `rebuild-site` → вставить содержимое `index.ts` → Deploy. Или из консоли: `supabase functions deploy rebuild-site --project-ref <ref>`.

Ответы: `200 {ok:true}`, `401` нет или недействителен вход, `403` нет прав, `502 {error, status}` GitHub не принял запуск (чаще всего истёк токен или у него нет права Actions).

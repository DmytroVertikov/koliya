# notify-feedback: обращения с сайта в Telegram

Каждое новое обращение из формы «Обратная связь» (и 👎 с комментарием) приходит вам в Telegram. 👍 без текста не присылается, он виден только в админке.

## Настройка (один раз)

1. **Бот.** В Telegram откройте @BotFather → `/newbot` → получите токен.
2. **Ваш chat id.** Напишите вашему боту любое сообщение, затем откройте в браузере `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id":…}`.
3. **Секреты.** Supabase → Edge Functions → Secrets, добавьте `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` и `WEBHOOK_SECRET` (любая длинная случайная строка).
4. **Деплой.** `supabase functions deploy notify-feedback --no-verify-jwt`
   (или Supabase → Edge Functions → Deploy a new function, вставить `index.ts`, и выключить «Verify JWT»).
5. **Вебхук.** Supabase → Database → Webhooks → Create a new hook:
   - Table: `feedback`, Events: только `Insert`
   - Type: Supabase Edge Functions → `notify-feedback`, метод POST
   - HTTP Headers: добавьте `x-webhook-secret` со значением вашего `WEBHOOK_SECRET`

## Проверка
Отправьте тестовое сообщение через форму на сайте: через пару секунд оно придёт в Telegram. Если не пришло, смотрите Edge Functions → notify-feedback → Logs (401 — не совпал секрет, 502 — Telegram отклонил токен или chat id).

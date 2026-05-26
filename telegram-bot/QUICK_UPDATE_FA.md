# بروز‌رسانی سریع (۵ دقیقه‌ای)

## اگر Git دارید (سریع‌ترین روش)

```bash
cd /path/to/fredobot/telegram-bot
git pull origin main
npm start
```

## اگر Git ندارید

### مرحله ۱: فایل‌های اصلاح‌شده را دانلود کنید

دانلود این فایل‌ها:
- `src/services/userService.js`
- `src/handlers/userHandlers.js`
- `src/handlers/messageHandler.js`
- `src/handlers/adminHandlers.js`

### مرحله ۲: کپی کنید

```bash
# فایل‌ها را به شاخه صحیح منتقل کنید
cp userService.js /path/to/fredobot/telegram-bot/src/services/
cp userHandlers.js /path/to/fredobot/telegram-bot/src/handlers/
cp messageHandler.js /path/to/fredobot/telegram-bot/src/handlers/
cp adminHandlers.js /path/to/fredobot/telegram-bot/src/handlers/
```

### مرحله ۳: ربات را شروع کنید

```bash
cd /path/to/fredobot/telegram-bot
npm start
```

## بس!

اصلاحات اعمال شده است. ربات بدون خطا کار می‌کند.

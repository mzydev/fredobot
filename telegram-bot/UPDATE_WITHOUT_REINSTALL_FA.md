# راهنمایی اعمال تغییرات بدون دوباره نصب

اگر پروژه را قبلاً روی سرور نصب کرده‌اید، می‌توانید تغییرات را بدون حذف و دوباره نصب اعمال کنید.

## روش ۱: استفاده از Git (بهترین روش)

اگر پروژه را با Git کلون کردید:

```bash
cd /path/to/fredobot/telegram-bot

# مطمئن شوید در شاخه صحیح هستید
git branch

# تغییرات جدید را دانلود کنید
git pull origin main

# یا اگر از شاخه دیگری استفاده می‌کنید
git pull origin your-branch-name
```

## روش ۲: دانلود فایل‌های اصلاح‌شده به صورت دستی

اگر Git راه‌اندازی نشده است، فایل‌های اصلاح‌شده را دانلود کنید:

### فایل‌های اصلاح‌شده:

```
src/services/userService.js
src/handlers/userHandlers.js
src/handlers/messageHandler.js
src/handlers/adminHandlers.js
.env (تنظیمات MySQL)
```

### مراحل:

1. فایل‌های نو را دانلود کنید
2. آنها را به جای فایل‌های قدیمی قرار دهید:

```bash
# به پوشه پروژه بروید
cd /path/to/fredobot/telegram-bot

# فایل‌های اصلاح‌شده را کپی کنید
# (فرض کنید در پوشه ~/downloads هستند)

cp ~/downloads/userService.js src/services/
cp ~/downloads/userHandlers.js src/handlers/
cp ~/downloads/messageHandler.js src/handlers/
cp ~/downloads/adminHandlers.js src/handlers/
cp ~/downloads/.env .env  # (اگر نیاز دارید)
```

## روش ۳: اصلاحات دستی (اگر فقط تعدادی فایل نیاز دارد)

اگر می‌خواهید خود تغییرات را اعمال کنید:

### تغییر ۱: userService.js

در توابع زیر، balance را به parseFloat تبدیل کنید:

```javascript
// در getOrCreateUser()
if (user.balance !== null && user.balance !== undefined) {
  user.balance = parseFloat(user.balance);
}

// در getUser()
if (user.balance !== null && user.balance !== undefined) {
  user.balance = parseFloat(user.balance);
}

// در getUserById()
if (user.balance !== null && user.balance !== undefined) {
  user.balance = parseFloat(user.balance);
}

// در getAllUsers()
return users.map(user => {
  if (user.balance !== null && user.balance !== undefined) {
    user.balance = parseFloat(user.balance);
  }
  return user;
});
```

### تغییر ۲: userHandlers.js

در دستور `/start`:

```javascript
const balance = parseFloat(user.balance) || 0;
```

در دستور `/account`:

```javascript
message += `Balance: $${(parseFloat(user.balance) || 0).toFixed(2)}\n\n`;
```

### تغییر ۳: messageHandler.js

در بخش خریدی:

```javascript
const userBalance = parseFloat(user.balance) || 0;
```

### تغییر ۴: adminHandlers.js

در بخش بازگشت به منوی کاربری:

```javascript
const balance = parseFloat(user?.balance) || 0;
```

## بعد از اعمال تغییرات

```bash
# ربات را متوقف کنید (Ctrl+C)

# ربات را دوباره شروع کنید
npm start

# اگر از PM2 استفاده می‌کنید
pm2 restart vpn-bot
```

## بررسی اصلاحات

1. ربات را در تلگرام جستجو کنید
2. `/start` را بفرستید
3. باید منوی اصلی بدون خطا نشان داده شود

## نکات مهم

✅ **نیازی به حذف دیتابیس نیست**

✅ **تمام داده‌های قدیمی محفوظ می‌ماند**

✅ **فقط فایل‌های مربوطه تغییر می‌خورند**

❌ **توکن ربات را تغییر ندهید**

❌ **تنظیمات MySQL را تغییر ندهید**

## اگر مشکلی داشتید

اگر بعد از اعمال تغییرات مشکل پیدا شد:

```bash
# خطاها را بررسی کنید
npm start

# یا اگر از PM2 استفاده می‌کنید
pm2 logs vpn-bot
```

تمام خطاها با پیشوند `[v0]` نشان داده می‌شوند.

# حل مسائل ربات VPN

## مشکل ۱: "Access denied for user 'bot_user'"

### علامت‌ها:
```
[v0] Database setup failed: Access denied for user 'bot_user'@'localhost'
```

### دلیل:
کاربر MySQL وجود ندارد یا رمز اشتباه است.

### حل:
```bash
# وارد MySQL با root شوید
mysql -u root -p

# کاربر را بازسازی کنید
DROP USER IF EXISTS 'bot_user'@'localhost';
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'رمز_جدید';
GRANT ALL PRIVILEGES ON vpn_bot_db.* TO 'bot_user'@'localhost';
FLUSH PRIVILEGES;

# بررسی کنید کاربر ایجاد شد
SELECT user FROM mysql.user WHERE user='bot_user';

EXIT;
```

حالا `.env` را تغییر دهید و دستور `npm run setup-db` را اجرا کنید.

---

## مشکل ۲: "Can't connect to local MySQL server"

### علامت‌ها:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

### دلیل:
MySQL روشن نیست.

### حل:
```bash
# بررسی وضعیت
sudo systemctl status mysql

# اگر خاموش است
sudo systemctl start mysql

# اگر سرویس وجود ندارد
sudo systemctl restart mysql

# بررسی دوباره
sudo systemctl status mysql
```

---

## مشکل ۳: "Database vpn_bot_db does not exist"

### علامت‌ها:
```
[v0] Database setup failed: Unknown database 'vpn_bot_db'
```

### دلیل:
دیتابیس ایجاد نشده است.

### حل:
```bash
# وارد MySQL شوید
mysql -u root -p

# دیتابیس را بسازید
CREATE DATABASE vpn_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;

# دستور setup را دوباره اجرا کنید
npm run setup-db
```

---

## مشکل ۴: "Unexpected error in setup" یا خطای غیرمعمولی

### حل:
```bash
# ابتدا بررسی کنید MySQL اتصال دارد
mysql -u bot_user -p vpn_bot_db

# اگر موفق شد، جداول را بررسی کنید
SHOW TABLES;

# اگر جداول خالی هستند، دستور setup را دوباره اجرا کنید
EXIT;
npm run setup-db
```

---

## مشکل ۵: ربات پاسخ نمی‌دهد

### علامت‌ها:
- دستور `/start` کار نمی‌کند
- هیچ پاسخی دریافت نمی‌کنید

### دلیل‌های احتمالی:
۱. ربات اجرا نمی‌شود
۲. توکن اشتباه است
۳. اتصال MySQL قطع است

### حل:
```bash
# ۱. بررسی کنید توکن صحیح است
cat .env | grep BOT_TOKEN

# ۲. MySQL را شروع کنید
sudo systemctl start mysql

# ۳. ربات را شروع کنید
npm start

# باید این پیام را ببینید:
# [v0] Database connection successful
# [v0] Bot is running! Listening for messages...
```

---

## مشکل ۶: خطای "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"

### علامت‌ها:
```
Error: PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR
```

### دلیل:
اتصال MySQL قطع شده و دوباره بازیابی نشد.

### حل:
```bash
# MySQL را دوباره شروع کنید
sudo systemctl restart mysql

# یک لحظه صبر کنید
sleep 2

# ربات را شروع کنید
npm start
```

---

## مشکل ۷: "Error: ER_NO_REFERENCED_TABLE"

### علامت‌ها:
```
Error: ER_NO_REFERENCED_TABLE
```

### دلیل:
جداول ترتیب نادرستی ایجاد شده‌اند.

### حل:
```bash
# وارد MySQL شوید
mysql -u bot_user -p vpn_bot_db

# تمام جداول را حذف کنید
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS configs;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS users;

EXIT;

# دستور setup را دوباره اجرا کنید
npm run setup-db
```

---

## مشکل ۸: "Module not found: mysql2"

### علامت‌ها:
```
Error: Cannot find module 'mysql2'
```

### دلیل:
وابستگی‌ها نصب نشده‌اند.

### حل:
```bash
# وابستگی‌ها را نصب کنید
npm install

# دوباره سعی کنید
npm start
```

---

## مشکل ۹: "EADDRINUSE" یا "Port already in use"

### علامت‌ها:
```
Error: listen EADDRINUSE: address already in use :::3000
```

### دلیل:
پورتی که ربات می‌خواهد استفاده کند، تماماً است.

### حل:
```bash
# پروسس قدیم را بیابید و بکشید
lsof -i :3000

# یا ربات را روی پورت دیگری اجرا کنید
PORT=3001 npm start
```

---

## مشکل ۱۰: "ربات بعد از بند شدن terminal خاموش می‌شود"

### حل:
استفاده از PM2 برای اجرای مستمر:

```bash
# نصب PM2
sudo npm install -g pm2

# شروع ربات
pm2 start src/bot.js --name "vpn-bot"

# فعال‌سازی شروع خودکار
pm2 startup
pm2 save

# بررسی وضعیت
pm2 status
```

---

## بررسی فهرست

قبل از درخواست کمک، این موارد را بررسی کنید:

- [ ] MySQL نصب و اجرا می‌شود؟ (`sudo systemctl status mysql`)
- [ ] دیتابیس وجود دارد؟ (`mysql -u bot_user -p -e "SHOW DATABASES;"`)
- [ ] کاربر MySQL وجود دارد؟ (`mysql -u bot_user -p`)
- [ ] فایل `.env` تنظیم شده؟ (`cat .env`)
- [ ] مقادیر `.env` صحیح‌اند؟ (`grep BOT_TOKEN .env`)
- [ ] وابستگی‌ها نصب شده‌اند؟ (`npm list`)
- [ ] دیتابیس راه‌اندازی شده؟ (`npm run setup-db`)

---

## درخواست کمک

اگر مشکل شما در اینجا نیست:

1. لاگ کامل خطا را کپی کنید
2. این دستورات را اجرا کنید و نتیجه را نگاه کنید:

```bash
# ۱. بررسی MySQL
mysql -u bot_user -p vpn_bot_db -e "SHOW TABLES;"

# ۲. بررسی .env
cat .env

# ۳. ربات را شروع کنید و لاگ را ببینید
npm start
```

3. تمام این اطلاعات را ضمیمه کنید (بدون رمزها!)

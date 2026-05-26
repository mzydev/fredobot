# شروع سریع ربات VPN (۱۰ دقیقه)

اگر MySQL نصب شده دارید و می‌خواهید سریع شروع کنید، این راهنما برای شماست.

## قدم ۱: MySQL را آماده کنید

```bash
# وارد MySQL شوید
mysql -u root -p

# داخل MySQL:
CREATE DATABASE vpn_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'MyPassword123';
GRANT ALL PRIVILEGES ON vpn_bot_db.* TO 'bot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## قدم ۲: پروژه را تنظیم کنید

```bash
# رفتن به پروژه
cd fredobot/telegram-bot

# فایل .env را تنظیم کنید
nano .env

# این مقادیر را بنویسید:
# BOT_TOKEN=توکن_از_BotFather
# MYSQL_PASSWORD=MyPassword123
# ADMIN_IDS=شماسه_عددی_تلگرام_شما
```

## قدم ۳: دیتابیس را راه‌اندازی کنید

```bash
npm install
npm run setup-db
```

## قدم ۴: ربات را شروع کنید

```bash
npm start
```

## قدم ۵: تست کنید

ربات خود را در تلگرام جستجو کنید و `/start` را بفرستید.

---

**آن‌ها! ربات شما الآن فعال است! 🎉**

برای اطلاعات کامل، README_FA.md را بخوانید.

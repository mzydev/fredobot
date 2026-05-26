# راهنمایی تفصیلی نصب ربات VPN

این راهنما نصب مرحله‌به‌مرحله ربات تلگرام VPN را برای سرور Linux توضیح می‌دهد.

## پیش‌نیازها

- سرور Linux (Ubuntu 20.04+، Debian 11+ یا CentOS 7+)
- دسترسی `sudo` (یا کاربر root)
- اتصال اینترنت

## مرحله ۱: نصب Node.js و npm

### برای Ubuntu/Debian:

```bash
# بروزرسانی بسته‌ها
sudo apt update
sudo apt upgrade -y

# نصب curl (اگر نصب نشده)
sudo apt install -y curl

# دانلود Node.js setup
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# نصب Node.js
sudo apt install -y nodejs

# بررسی نسخه‌ها
node --version
npm --version
```

### برای CentOS/RHEL:

```bash
# نصب curl و gnupg
sudo yum install -y curl gnupg

# دانلود setup
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# نصب Node.js
sudo yum install -y nodejs

# بررسی نسخه‌ها
node --version
npm --version
```

---

## مرحله ۲: نصب MySQL

### برای Ubuntu/Debian:

```bash
# بروزرسانی بسته‌ها
sudo apt update

# نصب MySQL Server
sudo apt install -y mysql-server

# شروع سرویس
sudo systemctl start mysql

# فعال‌سازی برای شروع خودکار
sudo systemctl enable mysql

# بررسی وضعیت
sudo systemctl status mysql
```

خروجی باید این‌طور باشد:
```
● mysql.service - MySQL Community Server
     Loaded: loaded (/lib/systemd/system/mysql.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

### برای CentOS/RHEL:

```bash
# نصب MySQL
sudo yum install -y mysql-server

# شروع سرویس
sudo systemctl start mysqld

# فعال‌سازی برای شروع خودکار
sudo systemctl enable mysqld

# بررسی وضعیت
sudo systemctl status mysqld
```

---

## مرحله ۳: ایمن‌سازی MySQL

```bash
# اجرای اسکریپت ایمن‌سازی
sudo mysql_secure_installation
```

برنامه سؤالات زیر را می‌پرسد. پاسخ‌های توصیه‌شده:

```
Validate password component can be used to test passwords
and improve security of MySQL... [Y/n]: y

There are three levels of password validation policy...
Please enter 0 = LOW, 1 = MEDIUM and 2=STRONG: 1

New password: MySecure@Pass123
Re-enter new password: MySecure@Pass123

Remove anonymous users? [Y/n]: y

Disallow root remote login? [Y/n]: y

Remove test database and access to it? [Y/n]: y

Reload privilege tables now? [Y/n]: y
```

---

## مرحله ۴: ایجاد دیتابیس و کاربر

```bash
# وارد شدن به MySQL
mysql -u root -p
```

رمزی که در مرحله ۳ تعریف کردید را وارد کنید.

**داخل MySQL Command Line:**

```sql
-- ایجاد دیتابیس
CREATE DATABASE vpn_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'MySecure@Pass123';

-- اختیارات کاربر
GRANT ALL PRIVILEGES ON vpn_bot_db.* TO 'bot_user'@'localhost';

-- اعمال تغییرات
FLUSH PRIVILEGES;

-- بررسی کاربر
SELECT user, host FROM mysql.user WHERE user='bot_user';

-- لیست دیتابیس‌ها
SHOW DATABASES;

-- خروج
EXIT;
```

---

## مرحله ۵: دریافت توکن ربات

1. در تلگرام `@BotFather` را جستجو کنید
2. دستور `/newbot` را بفرستید
3. نام ربات را وارد کنید (مثال: `VPN Config Bot`)
4. نام‌کاربری ربات را وارد کنید:
   - باید با `bot` تمام شود
   - باید یکتا باشد (مثال: `my_vpn_bot`)
5. توکن را کپی کنید (مثال):
   ```
   1234567890:ABCdefGHIjklmnoPQRstuvWXYZ-ExampleToken
   ```

---

## مرحله ۶: دانلود پروژه

```bash
# رفتن به پوشه مورد نظر
cd /home

# کلون کردن پروژه
git clone https://github.com/mzydev/fredobot.git

# رفتن به پوشه ربات
cd fredobot/telegram-bot

# لیست فایل‌ها
ls -la
```

باید فایل‌های زیر را ببینید:
```
package.json
README_FA.md
src/
.env.example
```

---

## مرحله ۷: تنظیم محیط

```bash
# کپی فایل نمونه
cp .env.example .env

# باز کردن فایل برای ویرایش
nano .env
```

**فایل `.env` را این‌گونه تنظیم کنید:**

```env
# توکن از BotFather
BOT_TOKEN=1234567890:ABCdefGHIjklmnoPQRstuvWXYZ-ExampleToken

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=bot_user
MYSQL_PASSWORD=MySecure@Pass123
MYSQL_DATABASE=vpn_bot_db

# شناسه تلگرام شما (برای دسترسی مدیر)
ADMIN_IDS=123456789

# محیط
NODE_ENV=production
```

**برای دریافت شناسه تلگرام:**
1. `@userinfobot` را جستجو کنید
2. هر پیامی برایش بفرستید
3. عدد `id` را کپی کنید

**ذخیره کردن:**
- `Ctrl + O` سپس `Enter`
- `Ctrl + X`

---

## مرحله ۸: نصب وابستگی‌ها

```bash
# مطمئن شوید در پوشه ربات هستید
pwd
# خروجی باید به این‌صورت باشد: .../fredobot/telegram-bot

# نصب وابستگی‌ها
npm install

# انتظار برای تکمیل (۲-۵ دقیقه)
```

---

## مرحله ۹: راه‌اندازی دیتابیس

```bash
# اجرای اسکریپت راه‌اندازی
npm run setup-db
```

**خروجی صحیح:**
```
[v0] Database setup started...
[v0] Creating tables...
✓ Database created successfully
✓ Tables created successfully
✓ Admin user created
Database setup completed successfully!
```

---

## مرحله ۱۰: شروع ربات

```bash
# شروع ربات
npm start
```

**خروجی صحیح:**
```
[v0] Starting bot...
[v0] Database connection successful
[v0] Bot is running! Listening for messages...
```

ربات الآن اجرا می‌شود!

---

## مرحله ۱۱: تست ربات

1. ربات خود را در تلگرام جستجو کنید (نام‌کاربری که وارد کردید)
2. دستور `/start` را بفرستید
3. باید منوی اصلی نشان داده شود

---

## مرحله ۱۲: اجرای مستمر (اختیاری)

برای اینکه ربات حتی بعد از بسته‌شدن terminal ادامه بدهد:

```bash
# نصب PM2 (مدیریت پروسس)
sudo npm install -g pm2

# شروع ربات با PM2
pm2 start src/bot.js --name "vpn-bot"

# ذخیره تنظیمات
pm2 save

# فعال‌سازی شروع خودکار در هنگام بوت شدن سرور
pm2 startup

# دستور خروجی را کپی و اجرا کنید
# (خودکار توسط PM2 نشان داده می‌شود)

# بررسی وضعیت
pm2 status
pm2 logs vpn-bot
```

---

## فایل‌های مهم

بعد از نصب، ساختار پروژه به این‌صورت است:

```
fredobot/
└── telegram-bot/
    ├── .env (تنظیمات - این را تغییر دهید!)
    ├── src/
    │   ├── bot.js (فایل اصلی)
    │   ├── config/database.js (اتصال MySQL)
    │   ├── database/
    │   │   ├── schema.sql (ساختار جداول)
    │   │   └── setup.js (راه‌اندازی)
    │   ├── handlers/ (دستورات ربات)
    │   └── services/ (منطق کسب‌وکار)
    ├── package.json (وابستگی‌ها)
    ├── README_FA.md (راهنمای کامل)
    ├── QUICKSTART_FA.md (شروع سریع)
    └── TROUBLESHOOTING_FA.md (حل مسائل)
```

---

## دستورات مفید

```bash
# مشاهده لاگ‌های ربات
pm2 logs vpn-bot

# توقف ربات
pm2 stop vpn-bot

# شروع مجدد
pm2 restart vpn-bot

# حذف ربات از PM2
pm2 delete vpn-bot

# بررسی MySQL
mysql -u bot_user -p vpn_bot_db

# بررسی جداول
mysql -u bot_user -p vpn_bot_db -e "SHOW TABLES;"

# توقف MySQL
sudo systemctl stop mysql

# شروع MySQL
sudo systemctl start mysql
```

---

## نکات امنیتی

⚠️ **هرگز:**
- توکن ربات را با کسی شریک نکنید
- فایل `.env` را در GitHub آپلود نکنید
- رمز MySQL را در کد بنویسید

✅ **همیشه:**
- از رمزهای قوی استفاده کنید
- دیتابیس را منظم بک‌آپ کنید
- Firewall خود را تنظیم کنید

---

## بک‌آپ و بازیابی

```bash
# بک‌آپ گرفتن
mysqldump -u bot_user -p vpn_bot_db > backup.sql

# بازیابی
mysql -u bot_user -p vpn_bot_db < backup.sql
```

---

## خطاها و حل‌ها

اگر مشکلی داشتید، به فایل `TROUBLESHOOTING_FA.md` مراجعه کنید.

---

**تبریک! ربات شما اکنون نصب و اجرا می‌شود! 🎉**

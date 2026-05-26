# راهنمایی کامل نصب و راه‌اندازی ربات تلگرام VPN

این راهنما شما را از ابتدا تا انجام برای راه‌اندازی ربات تلگرام VPN با دیتابیس MySQL راهنمایی می‌کند.

---

## فهرست مطالب

1. [نیازمندی‌های سیستم](#نیازمندی‌های-سیستم)
2. [مرحله ۱: نصب MySQL](#مرحله-۱-نصب-mysql)
3. [مرحله ۲: راه‌اندازی دیتابیس](#مرحله-۲-راه‌اندازی-دیتابیس)
4. [مرحله ۳: دانلود پروژه](#مرحله-۳-دانلود-پروژه)
5. [مرحله ۴: تنظیم محیط](#مرحله-۴-تنظیم-محیط)
6. [مرحله ۵: نصب وابستگی‌ها](#مرحله-۵-نصب-وابستگی‌ها)
7. [مرحله ۶: راه‌اندازی دیتابیس ربات](#مرحله-۶-راه‌اندازی-دیتابیس-ربات)
8. [مرحله ۷: شروع ربات](#مرحله-۷-شروع-ربات)
9. [مرحله ۸: تست و استفاده](#مرحله-۸-تست-و-استفاده)
10. [حل مسائل](#حل-مسائل)

---

## نیازمندی‌های سیستم

قبل از شروع، مطمئن شوید که دارای موارد زیر هستید:

- **سرور Linux** (Ubuntu 20.04+ یا Debian 11+)
- **Node.js 16+**
- **npm یا yarn**
- **MySQL 8.0+**
- **اتصال اینترنت**

---

## مرحله ۱: نصب MySQL

### ۱۱. بروزرسانی لیست بسته‌ها

```bash
sudo apt update
sudo apt upgrade -y
```

### ۱۲. نصب MySQL Server

```bash
sudo apt install -y mysql-server
```

### ۱۳. شروع سرویس MySQL

```bash
# شروع MySQL
sudo systemctl start mysql

# فعال‌کردن برای شروع خودکار
sudo systemctl enable mysql

# بررسی وضعیت
sudo systemctl status mysql
```

اگر خروجی `active (running)` باشد، MySQL با موفقیت نصب شد.

### ۱۴. ایمن‌سازی MySQL

```bash
sudo mysql_secure_installation
```

برنامه سؤالات زیر را می‌پرسد. **برای هر کدام، پاسخ های زیر را وارد کنید:**

```
Validate password component can be used to test passwords
and improve security of MySQL... : y

There are three levels of password validation policy...
Please enter 0 = LOW, 1 = MEDIUM and 2=STRONG: 0

Would you like to continue with the password provided?(Press y|Y for Yes, any other key for No) : y

New password: [یک رمز قوی بنویسید و بخاطر بسپارید]
Re-enter new password: [دوباره بنویسید]

Remove anonymous users? Y

Disallow root remote login? Y

Remove test database and access to it? Y

Reload privilege tables now? Y
```

---

## مرحله ۲: راه‌اندازی دیتابیس

### ۲۱. وارد شدن به MySQL

```bash
mysql -u root -p
```

رمزی که در مرحله ۱۴ تعریف کردید را وارد کنید.

اگر موفق باشد، این پیام نشان داده می‌شود:

```
mysql>
```

### ۲۲. ایجاد دیتابیس

**داخل MySQL Console:**

```sql
CREATE DATABASE vpn_bot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ۲۳. ایجاد کاربر MySQL

```sql
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'رمز_محکم_بنویسید';
```

**مثال:**

```sql
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'MySecure@Pass123';
```

### ۲۴. اختیارات کاربر را تنظیم کنید

```sql
GRANT ALL PRIVILEGES ON vpn_bot_db.* TO 'bot_user'@'localhost';
FLUSH PRIVILEGES;
```

### ۲۵. بررسی کنید

```sql
-- لیست کاربران
SELECT user, host FROM mysql.user;

-- لیست دیتابیس‌ها
SHOW DATABASES;

-- خروج از MySQL
EXIT;
```

---

## مرحله ۳: دانلود پروژه

### ۳۱. کلون کردن پروژه از GitHub

```bash
# به پوشه مورد نظر برید
cd /home

# کلون کردن
git clone https://github.com/mzydev/fredobot.git

# رفتن به پوشه ربات
cd fredobot/telegram-bot
```

### ۳۲. بررسی پروژه

```bash
ls -la
```

باید فایل‌های زیر را ببینید:

```
package.json
.env.example
src/
README.md
...
```

---

## مرحله ۴: تنظیم محیط

### ۴۱. ایجاد فایل .env

```bash
cp .env.example .env
```

### ۴۲. باز کردن و تغییر .env

```bash
nano .env
```

یا

```bash
vim .env
```

### ۴۳. تغییر مقادیر

**یافتن و تغییر این خطوط:**

```env
# توکن ربات (از BotFather)
BOT_TOKEN=توکن_دقیق_تلگرام

# تنظیمات MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=bot_user
MYSQL_PASSWORD=رمز_کاربری_که_تعریف_کردید
MYSQL_DATABASE=vpn_bot_db

# شناسه مدیر (شماسه عددی تلگرام شما)
ADMIN_IDS=شماسه_عددی

# حالت
NODE_ENV=production
```

**مثال کامل:**

```env
BOT_TOKEN=1234567890:ABCdefGHIjklmnoPQRstuvWXYZ-example

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=bot_user
MYSQL_PASSWORD=MySecure@Pass123
MYSQL_DATABASE=vpn_bot_db

ADMIN_IDS=123456789

NODE_ENV=production
```

### ۴۴. ذخیره کردن

**اگر از nano استفاده کردید:**
- `Ctrl + O` (Save)
- `Enter` (Confirm)
- `Ctrl + X` (Exit)

**اگر از vim استفاده کردید:**
- `Esc` سپس `:wq` سپس `Enter`

---

## مرحله ۵: نصب وابستگی‌ها

```bash
# مطمئن شوید در پوشه ربات هستید
cd /path/to/fredobot/telegram-bot

# نصب وابستگی‌ها
npm install
```

انتظار برای نصب تمام بسته‌ها بکشید (۲-۵ دقیقه طول می‌کشد).

---

## مرحله ۶: راه‌اندازی دیتابیس ربات

### ۶۱. اجرای Setup Script

```bash
npm run setup-db
```

**خروجی موفقیت‌آمیز:**

```
[v0] Database setup started...
[v0] Creating tables...
✓ Database created successfully
✓ Tables created successfully
✓ Admin user created
Database setup completed successfully!
```

اگر خطا داشت، به بخش [حل مسائل](#حل-مسائل) مراجعه کنید.

### ۶۲. بررسی دیتابیس

```bash
# وارد شدن به MySQL
mysql -u bot_user -p vpn_bot_db

# بررسی جداول
SHOW TABLES;
```

باید جداول زیر را ببینید:

```
+-------------------+
| Tables_in_vpn_bot |
+-------------------+
| users             |
| configs           |
| purchases         |
| payments          |
| admin_users       |
| transactions      |
+-------------------+
```

```sql
-- مشاهده جزئیات جدول users
DESC users;

-- خروج
EXIT;
```

---

## مرحله ۷: شروع ربات

### ۷۱. دریافت توکن ربات

**اگر هنوز توکن ندارید:**

1. در تلگرام `@BotFather` را جستجو کنید
2. دستور `/newbot` را بفرستید
3. نام ربات را وارد کنید (مثال: `VPN Config Bot`)
4. نام‌کاربری ربات را وارد کنید (باید با `bot` تمام شود)
5. توکن را کپی کنید و در `.env` بگذارید

### ۷۲. شروع ربات

```bash
npm start
```

**خروجی صحیح:**

```
[v0] Starting bot...
[v0] Database connection successful
[v0] Bot is running! Listening for messages...
```

اگر هیچ خطا نشان ندهد، ربات با موفقیت اجرا می‌شود!

### ۷۳. اجرای مستمر (Background)

برای اینکه ربات حتی بعد از بسته‌شدن terminal ادامه بدهد:

```bash
# نصب PM2
sudo npm install -g pm2

# شروع ربات با PM2
pm2 start src/bot.js --name "vpn-bot"

# ذخیره تنظیمات
pm2 save

# فعال‌سازی شروع خودکار
pm2 startup
```

**دستورات مفید PM2:**

```bash
# مشاهده وضعیت
pm2 status

# دیدن logs
pm2 logs vpn-bot

# توقف ربات
pm2 stop vpn-bot

# شروع مجدد
pm2 restart vpn-bot

# حذف
pm2 delete vpn-bot
```

---

## مرحله ۸: تست و استفاده

### ۸۱. تست ربات

1. ربات خود را در تلگرام جستجو کنید
2. دستور `/start` را بفرستید
3. باید منوی اصلی نشان داده شود

### ۸۲. دستورات موجود

**برای کاربران عادی:**

```
/start          - منوی اصلی
/buy            - خریدی یکی از پلن‌ها
/myconfigs      - مشاهده‌ی تنظیمات فعال
/account        - اطلاعات حساب
/addbalance     - افزایش موجودی
/help           - راهنما
```

**برای مدیر (شماسه شما):**

```
/admin          - منوی مدیریت
  - اضافه کردن کنفیگ
  - مشاهده آمار
  - تایید پرداخت‌ها
  - ارسال پیام برای همه
```

### ۸۳. اضافه کردن کنفیگ VPN

1. دستور `/admin` را بفرستید
2. گزینه "افزودن کنفیگ" را انتخاب کنید
3. اطلاعات کنفیگ را وارد کنید
4. قیمت را تعریف کنید

---

## حل مسائل

### مشکل ۱: "Access denied for user 'bot_user'"

**دلیل:** کاربر MySQL وجود ندارد یا رمز اشتباه است

**راه‌حل:**

```bash
# وارد MySQL با root شوید
mysql -u root -p

# دوباره کاربر را ایجاد کنید
DROP USER IF EXISTS 'bot_user'@'localhost';
CREATE USER 'bot_user'@'localhost' IDENTIFIED BY 'رمز_جدید';
GRANT ALL PRIVILEGES ON vpn_bot_db.* TO 'bot_user'@'localhost';
FLUSH PRIVILEGES;

# خروج
EXIT;
```

سپس `.env` را به‌روزرسانی کنید و دوباره امتحان کنید.

### مشکل ۲: "Can't connect to local MySQL server"

**دلیل:** MySQL روشن نیست

**راه‌حل:**

```bash
# بررسی وضعیت
sudo systemctl status mysql

# اگر خاموش است
sudo systemctl start mysql

# یا بازآغاز کنید
sudo systemctl restart mysql
```

### مشکل ۳: "Error: connect ECONNREFUSED"

**دلیل:** MySQL در حال اجرا نیست

**راه‌حل:**

```bash
sudo systemctl start mysql
```

### مشکل ۴: "An error occurred. Please try again later" در ربات

**دلیل:** خطایی در کد یا دیتابیس

**راه‌حل:**

```bash
# مشاهده logs
npm start
```

اگر خطا شنیدید، آن را بخاطر بسپارید و صورت‌مسئله‌ای بنویسید.

### مشکل ۵: "ربات پاسخ نمی‌دهد"

**دلیل:** ربات اجرا نمی‌شود یا توکن اشتباه است

**راه‌حل:**

```bash
# بررسی کنید توکن صحیح است
cat .env | grep BOT_TOKEN

# ربات را شروع کنید
npm start
```

---

## نکات مهم

### امنیت

⚠️ **هیچگاه:**
- توکن ربات را با کسی شریک نکنید
- رمز MySQL را در GitHub قرار ندهید
- فایل `.env` را آپلود نکنید

✅ **همیشه:**
- از رمزهای قوی استفاده کنید
- دیتابیس را منظم بک‌آپ کنید
- Firewall خود را بررسی کنید

### بک‌آپ دیتابیس

```bash
# بک‌آپ گرفتن
mysqldump -u bot_user -p vpn_bot_db > backup.sql

# بازیابی
mysql -u bot_user -p vpn_bot_db < backup.sql
```

### نظارت بر ربات

```bash
# مشاهده memory و CPU
pm2 monit

# دیدن logs
pm2 logs vpn-bot --lines 100

# ریست کردن logs
pm2 flush
```

---

## خلاصه فایل‌های اصلی

```
fredobot/
└── telegram-bot/
    ├── .env (تنظیمات - اینجا توکن و رمز MySQL)
    ├── package.json (وابستگی‌ها)
    ├── src/
    │   ├── bot.js (فایل اصلی)
    │   ├── config/
    │   │   └── database.js (اتصال MySQL)
    │   ├── database/
    │   │   ├── schema.sql (ساختار جداول)
    │   │   └── setup.js (راه‌اندازی)
    │   ├── handlers/
    │   │   ├── userHandlers.js (دستورات کاربر)
    │   │   ├── adminHandlers.js (دستورات مدیر)
    │   │   └── messageHandler.js (مسیردهی پیام‌ها)
    │   └── services/
    │       ├── userService.js
    │       ├── configService.js
    │       ├── purchaseService.js
    │       └── paymentService.js
    └── README_FA.md (این فایل!)
```

---

## چک‌لیست نهایی

- [ ] MySQL نصب شده و در حال اجرا
- [ ] دیتابیس `vpn_bot_db` ایجاد شده
- [ ] کاربر `bot_user` ایجاد شده
- [ ] پروژه کلون شده
- [ ] فایل `.env` تنظیم شده
- [ ] وابستگی‌ها نصب شده (`npm install`)
- [ ] دیتابیس راه‌اندازی شده (`npm run setup-db`)
- [ ] توکن ربات دریافت شده
- [ ] ربات شروع شده (`npm start`)
- [ ] ربات در تلگرام تست شده (`/start`)

---

## تماس و کمک

اگر مشکلی داشتید یا سؤالی دارید:

1. خروجی خطا را کپی کنید
2. لاگ‌ها را بررسی کنید (`npm start`)
3. این راهنما را دوباره خوانده اید

---

**نوشته‌شده برای نسخه ۱.۰.۰ ربات VPN**

آخرین به‌روزرسانی: ۲۰۲۶

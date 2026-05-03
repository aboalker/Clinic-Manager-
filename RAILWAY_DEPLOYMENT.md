# دليل النشر على Railway — طبيبي (ClinicOS)

هذا المشروع (monorepo) مهيأ ليُنشر كخدمة واحدة على Railway تخدم الـ API والواجهة الأمامية معاً.

---

## كيف يعمل النشر

1. **مرحلة البناء (Build)**
   - تثبيت الحزم بـ `pnpm install --frozen-lockfile`.
   - توليد عميل OpenAPI ومخططات Zod من `lib/api-spec/openapi.yaml`.
   - بناء واجهة React (`artifacts/clinic-app`) إلى `dist/public`.
   - حزم خادم Express (`artifacts/api-server`) إلى ملف واحد `dist/index.mjs`.

2. **مرحلة التشغيل (Start)**
   - تطبيق مخطط قاعدة البيانات تلقائياً عبر `drizzle-kit push --force`.
   - تشغيل خادم Express على `PORT` الذي تحدده Railway.
   - الخادم يخدم الواجهة الساكنة من `artifacts/clinic-app/dist/public` ويعرض الـ API تحت `/api`.

3. **قاعدة البيانات** PostgreSQL تأتي من Railway Postgres plugin عبر `DATABASE_URL`.

---

## المتغيرات البيئية المطلوبة

| المتغير | الوصف | كيف يُضبط |
|---|---|---|
| `DATABASE_URL` | سلسلة اتصال PostgreSQL | تُحقن تلقائياً عند ربط Railway Postgres plugin |
| `JWT_SECRET` | مفتاح توقيع كوكي الجلسة (يجب أن يكون ١٦ حرفاً على الأقل) | أنشئه بـ `openssl rand -base64 64` ثم ضعه يدوياً في Variables |
| `NODE_ENV` | يجب أن يكون `production` | يُضاف يدوياً في Variables |
| `PORT` | منفذ HTTP | تضبطه Railway تلقائياً، **لا تلمسه** |

> ⚠️ **مهم:** الخادم سيرفض الإقلاع في الإنتاج إذا كان `JWT_SECRET` غير موجود أو أقل من ١٦ حرفاً. هذا حماية متعمّدة.

---

## خطوات النشر التفصيلية

### 1) تجهيز المستودع
- ادفع الكود إلى مستودع GitHub خاص.
- تأكد أن الملفات التالية موجودة في الجذر:
  - `railway.json` — تعريف خطوات البناء والتشغيل
  - `nixpacks.toml` — نسخة احتياطية لإعدادات Nixpacks
  - `Procfile` — نسخة احتياطية إضافية
  - `pnpm-lock.yaml` — يجب أن يكون مدفوعاً (committed)
  - `.env.example` — مرجع للمتغيرات

### 2) إنشاء مشروع على Railway
1. ادخل [railway.app](https://railway.app) وأنشئ حساباً.
2. اضغط **New Project → Deploy from GitHub repo** واختر مستودعك.
3. انتظر حتى تكتشف Railway المستودع (ستلاحظ `NIXPACKS` كنوع البناء تلقائياً).

### 3) إضافة قاعدة بيانات PostgreSQL
1. داخل المشروع: **+ New → Database → Add PostgreSQL**.
2. سيظهر لك خدمة Postgres جديدة، ومتغير `DATABASE_URL` يُضاف تلقائياً لخدمة التطبيق (تأكد من ذلك في تبويب Variables → Reference).

### 4) ضبط المتغيرات البيئية
في تبويب **Variables** لخدمة التطبيق (وليس Postgres):
- أضف `JWT_SECRET` بقيمة طويلة وعشوائية. ولّدها محلياً:
  ```bash
  openssl rand -base64 64
  ```
- أضف `NODE_ENV` بقيمة `production`.
- تأكد أن `DATABASE_URL` مرتبط بقاعدة Postgres (Reference variable).
- **لا تضف** `PORT` — Railway تتولاه.

### 5) النشر
- اضغط **Deploy** أو ادفع أي commit جديد لتبدأ Railway البناء تلقائياً.
- راقب السجلات في تبويب **Deployments → View Logs**.
- البناء يستغرق ٢-٤ دقائق عادةً.
- عند النجاح، ستظهر رسالة: `Server listening { port: ... }` و `Serving static frontend`.

### 6) الحصول على الرابط العام
- في تبويب **Settings → Networking** اضغط **Generate Domain**.
- ستحصل على رابط مثل `clinicos-production.up.railway.app`.
- يمكنك ربط نطاقك الخاص لاحقاً من نفس الصفحة.

### 7) التحقق من النشر
افتح الرابط في المتصفح:
- يجب أن تُحوَّل تلقائياً إلى صفحة تسجيل الدخول.
- جرب إنشاء حساب جديد عبر `/signup` — يجب أن يعمل ويوجّهك إلى لوحة التحكم.
- اختبر `https://YOUR-DOMAIN/api/healthz` — يجب أن يعيد `{"status":"ok"}`.

---

## ملاحظات مهمة

### الترحيلات (Schema migrations)
عند كل نشر، يُشغَّل `drizzle-kit push --force` تلقائياً قبل بدء الخادم. هذا يعني:
- ✅ أي تعديل على `lib/db/src/schema/*.ts` يُطبَّق تلقائياً عند النشر التالي.
- ⚠️ **لا تستخدم drizzle push للحذف الإنتاجي** — استخدم migrations يدوية لإسقاط أعمدة فيها بيانات.

### السجلات (Logs)
الخادم يستخدم Pino بصيغة JSON. لمشاهدة السجلات بصيغة قابلة للقراءة في Railway استخدم زر **Filter** في صفحة الـ Logs.

### البناء المحلي للاختبار قبل النشر
لمحاكاة بيئة الإنتاج محلياً قبل النشر:
```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/clinic-app run build
pnpm --filter @workspace/api-server run build

NODE_ENV=production \
PORT=8080 \
JWT_SECRET="$(openssl rand -base64 64)" \
DATABASE_URL="postgresql://..." \
node artifacts/api-server/dist/index.mjs
```
ثم افتح `http://localhost:8080`.

### Healthcheck
Railway يفحص `/api/healthz` كل ٣٠ ثانية. إذا فشل ١٠ مرات متتالية يُعاد تشغيل الخدمة تلقائياً (ضُبط في `railway.json`).

### النسخ الاحتياطي للبيانات
من تبويب Postgres داخل Railway: **Data → Backups** لتفعيل النسخ التلقائي اليومي.

---

## استكشاف الأخطاء

| العَرَض | السبب المحتمل | الحل |
|---|---|---|
| `JWT_SECRET environment variable is required` | المتغير غير مضبوط أو أقل من ١٦ حرفاً | أعد توليده بـ `openssl rand -base64 64` |
| `DATABASE_URL, ensure the database is provisioned` | متغير قاعدة البيانات غير مرتبط | في Variables ربط `DATABASE_URL` كـ Reference من خدمة Postgres |
| البناء يفشل في خطوة `codegen` | تم تعديل `lib/api-spec/openapi.yaml` بشكل غير صالح | راجع التعديلات أو استرجع نسخة سابقة |
| الواجهة لا تظهر (تظهر "API only") | فشل بناء clinic-app أو حُذف dist | راجع logs البناء؛ تأكد من نجاح خطوة `clinic-app build` |
| الخادم يُعيد تشغيل نفسه باستمرار | فشل healthcheck | تأكد من فتح `/api/healthz` بنجاح؛ راجع logs لرسائل الخطأ |
| كوكي الجلسة لا يُحفظ | `NODE_ENV` ليس `production` فيُرسل بدون `secure` على HTTPS | ضع `NODE_ENV=production` |

---

## ملخص التكلفة المتوقعة
- خطة Railway المجانية: ٥$ رصيد شهري — يكفي لتجربة المنتج وعدد محدود من المستخدمين.
- للإنتاج التجاري: خطة Hobby بـ ٥$/شهر + استهلاك (تطبيق + قاعدة بيانات صغيرة ≈ ٧-١٢$/شهر).

---

تم تجهيز هذا المستودع وتجريبه بشكل كامل في وضع الإنتاج محلياً قبل توثيق هذا الدليل. كل الأوامر المذكورة تم اختبارها وتعمل.

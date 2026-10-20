# لوحة إدارة محتوى موقع الأرجوان — تعليمات التشغيل

## الوضع الحالي
الواجهة التجريبية: `/admin/content.html`. الموقع الأصلي محفوظ؛ كل تغييرات CMS في فرع `feature/content-management` ولم تُدمج بعد.

### ما تم برمجته
- مواضيع ومسودات: إضافة وتعديل وحذف، وقائمة عامة بالمنشور فقط.
- عرض الأخبار داخل الصفحة الرئيسية.
- رفع صور JPEG/PNG/WebP/GIF وفيديو MP4/WebM إلى Cloudflare R2 بحد 20 MiB لكل ملف.
- استخدام D1 لبيانات المقالات.

### خطوات الإعداد على Cloudflare
1. من Cloudflare D1، اختر قاعدة البيانات المرتبطة بالموقع باسم `DB`. نفّذ ملف `schema-cms.sql` عليها. لا تحذف جدول `site_stats` ولا تستبدل قاعدة بيانات الزيارات.
2. أنشئ R2 bucket باسم مناسب مثل `arjwan-cms-media`.
3. في إعدادات Cloudflare Pages الخاصة بالمشروع، أضف R2 binding باسم **CMS_MEDIA** يشير إلى bucket الذي أنشأته. يجب ربطه في بيئة النشر المطلوبة.
4. أضف secret باسم **CMS_ADMIN_TOKEN**، بقيمة عشوائية طويلة، عبر إعدادات Cloudflare، وليس عبر GitHub. لا ترسل الرمز في الرسائل ولا تضعه في ملف عام.
5. انشر فرعاً تجريبياً، واختبر إنشاء مسودة، نشر موضوع، تعديل موضوع، رفع صورة، رفع فيديو صغير، ثم حذف موضوع.
6. اختبر استجابة `/api/content` وقسم الأخبار في الصفحة الرئيسية، وكذلك احتفاظ `/api/visitors` بالعدد السابق.

## متطلبات الأمان قبل إطلاق لوحة الإدارة
**لا تُنشر لوحة الإدارة للعامة بصيغتها الحالية.** تستخدم Bearer token مؤقتاً يُدخل في المتصفح، وهو ليس بديلاً كافياً لنظام هوية وصلاحيات وجلسات. يجب إضافة مصادقة إدارية قوية، حماية CSRF عند اعتماد الجلسات، تحديد معدلات الطلبات، سجل تدقيق، قيود التخزين والحصص، حماية إضافية للتحميل، ونسخ احتياطية قبل الدمج.
يمكن استخدام Cloudflare Access لحماية مسارات الإدارة، لكن يجب التحقق من رموز Access في الخادم أو ضبط قواعد الوصول المناسبة؛ وجود Access أمام صفحة HTML وحده لا يكفي إذا بقيت API قابلة للوصول.

## حالة الاختبارات
الملفات رُفعت إلى GitHub، لكن لم تُجر اختبارات تشغيل على حساب Cloudflare ولم يُتحقق من وجود binding لـ D1 أو R2 أو secret. لا تُعتبر هذه النسخة جاهزة تجارياً بعد.

## Verified setup — 2026-10-20

- Production deployment: `2d703282-bbae-477a-bf2e-290e7037e6b6`, branch `main`, commit `efc6acf82a76a8f40bee4ecb2659da6d851c4400` (Cloudflare deploy success).
- Production D1: `almoraqebpro-visitors` / `8667f5d1-1b48-4727-9a00-d469e607ca9e`. The database had no application tables. Created only the missing `site_stats` table and seeded the requested cumulative display baseline of 1300. No existing application data was deleted. This baseline is not a verified unique-visitor count.
- Preview D1: `almoraqebpro-cms-preview` / `9fc1d766-60f0-4b48-94c4-a1f03a41029c`. Initialized `site_stats`, `cms_posts`, and `cms_products`. Set the project's preview `DB` binding to this database. Production binding retained unchanged.
- `wrangler.toml` remains local-development configuration (no `pages_build_output_dir`); it now points at preview to avoid accidental production SQL. Cloudflare controls deployment bindings. Do not migrate configuration sources without reviewing both environments.
- Access API reports `access.api.error.not_enabled`. An account owner must complete free Access onboarding in the dashboard. Do not purchase a plan or accept billing. Then create restricted admin applications/policies for both `/admin` and `/api/admin` paths and their descendants, allowing only the owner's email; configure `CMS_ACCESS_AUD`, `CMS_ACCESS_TEAM_DOMAIN`, and a long random `CMS_ADMIN_TOKEN` in preview. Ensure policies cover the branch alias and deployment hostnames; API middleware must reject every unconfigured/invalid audience regardless of hostname.
- R2 was inspected read-only. No new bucket or binding was created: R2's free allowance is followed by usage billing, which does not satisfy the owner's strict no-billing requirement. Use existing HTTPS media links for now; the upload API remains unavailable without `CMS_MEDIA`. Do not reuse another application's bucket.
- Local validation: `node --test tests/cms.test.mjs` passed 11 tests on Node 24 using real in-memory SQLite and cryptographic JWT signing/verification. Covers CRUD, draft privacy, invalid payloads, unauthorized access, cross-site writes, expired/forged/future JWTs, upload signatures/limits and counter preservation.
- Local tests are not a substitute for an authenticated Cloudflare end-to-end test. Owner sign-in, Access policy coverage, live upload, quotas/rate limits and audit logging remain release gates. Do not merge this branch into production yet.

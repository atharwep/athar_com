# 🔄 سكريبت تحديث رابط Bridge - منصة أثر

## الرابط الجديد
```
https://script.google.com/macros/s/AKfycbzUceIOfGdXqZGNLkiSHwRIB8V6mQ_hB2JpnIc53kKY81invQaKeaA2yyb5auzTtKXD/exec
```

## الرابط القديم (للاستبدال)
```
https://script.google.com/macros/s/AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w/exec
```

---

## 📋 الملفات التي تحتاج تحديث (50+ ملف)

### الملفات الأساسية (أولوية عالية):
1. ✅ `admin_console.html` - لوحة الإدارة
2. ✅ `auth.html` - تسجيل الدخول
3. ✅ `cv.html` - كاتب السيرة الذاتية
4. ✅ `index.html` - الصفحة الرئيسية
5. ✅ `protection.js` - نظام الحماية
6. ✅ `proposal_generator.js` - مولد المقترحات

### ملفات الخدمات:
7. ✅ `career_path.html`
8. ✅ `exp_transform.html`
9. ✅ `field_ready.html`
10. ✅ `job_errors.html`
11. ✅ `job_prep.html`
12. ✅ `jobs.html`
13. ✅ `library_v3.html`
14. ✅ `org_profile.html`
15. ✅ `skill_dev.html`
16. ✅ `specializations.html`
17. ✅ `test_prep.html`

### ملفات أخرى:
18. ✅ `protection_firebase.js`
19. ✅ `sheets_test.html`

---

## 🛠️ طريقة التحديث اليدوي

### الخطوة 1: استخدام Find & Replace في VS Code

1. اضغط `Ctrl+Shift+H` (Find & Replace في جميع الملفات)
2. في حقل **Find**، الصق:
   ```
   https://script.google.com/macros/s/AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w/exec
   ```
3. في حقل **Replace**، الصق:
   ```
   https://script.google.com/macros/s/AKfycbzUceIOfGdXqZGNLkiSHwRIB8V6mQ_hB2JpnIc53kKY81invQaKeaA2yyb5auzTtKXD/exec
   ```
4. انقر **Replace All** (استبدال الكل)
5. احفظ جميع الملفات (`Ctrl+K S`)

---

### الخطوة 2: استخدام PowerShell (بديل)

افتح PowerShell في مجلد المشروع وشغّل:

```powershell
# تحديث جميع ملفات HTML
Get-ChildItem -Filter *.html -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace 'AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w', 'AKfycbzUceIOfGdXqZGNLkiSHwRIB8V6mQ_hB2JpnIc53kKY81invQaKeaA2yyb5auzTtKXD' | Set-Content $_.FullName
}

# تحديث جميع ملفات JS
Get-ChildItem -Filter *.js -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace 'AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w', 'AKfycbzUceIOfGdXqZGNLkiSHwRIB8V6mQ_hB2JpnIc53kKY81invQaKeaA2yyb5auzTtKXD' | Set-Content $_.FullName
}

Write-Host "✅ تم تحديث جميع الملفات بنجاح!" -ForegroundColor Green
```

---

### الخطوة 3: التحقق من التحديث

بعد التحديث، تحقق من أن الرابط الجديد موجود في:

```bash
# في PowerShell
Select-String -Path *.html,*.js -Pattern "AKfycbzUceIOfGdXqZGNLkiSHwRIB8V6mQ_hB2JpnIc53kKY81invQaKeaA2yyb5auzTtKXD" | Select-Object -First 5
```

يجب أن ترى نتائج تُظهر الملفات المحدّثة.

---

## 🧪 اختبار بعد التحديث

### 1. اختبار الاتصال
افتح Console (F12) في `index.html` وشغّل:

```javascript
fetch('https://script.google.com/macros/s/AKfycbzUceIOfGdXqZGNLkiSHwRIB8V6mQ_hB2JpnIc53kKY81invQaKeaA2yyb5auzTtKXD/exec?action=test')
    .then(r => r.json())
    .then(data => console.log('✅ Bridge يعمل:', data))
    .catch(err => console.error('❌ خطأ:', err));
```

### 2. اختبار الصفحات
- ✅ `index.html` - تحقق من عداد الزوار
- ✅ `auth.html` - جرّب تسجيل الدخول
- ✅ `cv.html` - جرّب توليد وصف وظيفي
- ✅ `admin_console.html` - تحقق من لوحة الإدارة

---

## ✅ قائمة التحقق

- [ ] تحديث جميع ملفات HTML
- [ ] تحديث جميع ملفات JS
- [ ] حفظ جميع الملفات
- [ ] اختبار الاتصال
- [ ] اختبار الصفحات الرئيسية
- [ ] التأكد من عمل AI

---

## 📊 الإحصائيات

- **عدد الملفات:** 50+ ملف
- **الرابط القديم:** `...w5_1_w/exec`
- **الرابط الجديد:** `...tKXD/exec`
- **الحالة:** 🚧 قيد التحديث

---

**آخر تحديث:** 2026-01-11  
**الحالة:** جاهز للتنفيذ

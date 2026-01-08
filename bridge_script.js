
// ==========================================
// ATHAR PLATFORM BRIDGE V4 (FINAL)
// ==========================================

const CONFIG = {
    // مفاتيح الربط البرمجي (ضع مفاتيحك هنا)
    GROQ_API_KEY: "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",
    GEMINI_API_KEY: "AIza...",

    // مجلدات Google Drive (اختياري - للبحث في مجلدات محددة)
    LIBRARY_FOLDER_ID: "1e_dZ4Y6DL5z3cSLZn-d0oJQu0LbkumGF", // ضع معرف مجلد المكتبة هنا إذا وجد
    JOBS_FOLDER_ID: "",    // ضع معرف مجلد الوظائف هنا إذا وجد
    ADMIN_EMAIL: "jjbb3782@gmail.com" // البريد الافتراضي للمسؤول
};

function doGet(e) { return handleRequest(e); }
function doPost(e) {
    if (e.postData && e.postData.contents) {
        try {
            var jsonParam = JSON.parse(e.postData.contents);
            for (var key in jsonParam) { e.parameter[key] = jsonParam[key]; }
        } catch (e) { }
    }
    return handleRequest(e);
}

function handleRequest(e) {
    const action = e.parameter.action;
    const type = e.parameter.type;

    try {
        // 1. اختبار الاتصال
        if (action === "test") {
            const props = PropertiesService.getScriptProperties().getProperties();
            return sendJSON({
                status: "success",
                message: "Bridge V4 Online",
                hasGroqKey: !!(props.GROQ_API_KEY || CONFIG.GROQ_API_KEY)
            });
        }

        // 2. معالجة العمليات المتقدمة (AI Action)
        if (action === "ai") {
            let prompt = e.parameter.prompt;
            let systemPrompt = e.parameter.systemPrompt || "You are a professional expert that ONLY outputs valid JSON.";
            let model = e.parameter.model || "llama-3.3-70b-versatile";

            if (!prompt && e.parameter.messages) {
                try {
                    const msgs = Array.isArray(e.parameter.messages) ? e.parameter.messages : JSON.parse(e.parameter.messages);
                    const userMsg = msgs.find(m => m.role === "user");
                    const systemMsg = msgs.find(m => m.role === "system");
                    if (userMsg) prompt = userMsg.content;
                    if (systemMsg) systemPrompt = systemMsg.content;
                } catch (pe) { }
            }

            if (!prompt) return sendJSON({ status: "error", message: "No prompt provided" });

            let aiResponse = callGroqAI(prompt, systemPrompt, model);

            // Fallback strategy: Try Mixtral then Llama-8b
            const isError = (res) => res.startsWith("Error") || res.startsWith("BR_ERROR") || res.startsWith("GROQ_");

            if (isError(aiResponse)) {
                aiResponse = callGroqAI(prompt, systemPrompt, "mixtral-8x7b-32768");
            }
            if (isError(aiResponse)) {
                aiResponse = callGroqAI(prompt, systemPrompt, "llama-3.1-8b-instant");
            }

            if (isError(aiResponse)) {
                return sendJSON({ status: "error", message: aiResponse });
            }

            return sendJSON({ status: "success", data: aiResponse });
        }

        // 3. تسجيل كود العملية (Register ID)
        if (action === "registerId") {
            var id = e.parameter.id;
            if (!id) return sendJSON({ status: "error", message: "Missing ID" });

            var correctCode = parseInt(id) + 2025;
            var sheet = getSheet("ActivationCodes");
            sheet.appendRow([new Date(), id, correctCode, "Pending", ""]);
            return sendJSON({ status: "success", message: "Registered", expected: correctCode });
        }

        // 4. التحقق من الكود (Verify Code)
        if (action === "verifyCode") {
            var code = e.parameter.code;
            var id = e.parameter.id;
            if (!code || !id) return sendJSON({ status: "error", message: "Missing Data" });

            var sheet = getSheet("ActivationCodes");
            var data = sheet.getDataRange().getValues();
            var rowIndex = -1;
            var rowData = null;

            // بحث عكسي
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i][1] == id) {
                    rowIndex = i + 1;
                    rowData = data[i];
                    break;
                }
            }

            if (rowIndex === -1) {
                // Fallback calculation
                if (parseInt(code) === parseInt(id) + 2025) {
                    sheet.appendRow([new Date(), id, code, "Used", "Auto-Verified (Fallback)"]);
                    return sendJSON({ status: "success", message: "Verified" });
                }
                return sendJSON({ status: "error", message: "ID not found" });
            }

            if (rowData[3] === "Used") {
                return sendJSON({ status: "error", message: "❌ الكود مستخدم مسبقاً" });
            }

            if (code == rowData[2]) {
                sheet.getRange(rowIndex, 4).setValue("Used");
                return sendJSON({ status: "success", message: "Activated" });
            } else {
                return sendJSON({ status: "error", message: "❌ كود خاطئ" });
            }
        }

        // 5. جلب المكتبة (Library Fetch) - يدعم حتى 800 ملف
        if (type === "library" || type === "jobs") {
            // إما أن نقرأ من الشيت أو من الدرايف مباشرة
            // للأداء الأفضل، سنقرأ من الدرايف مباشرة مع حد أعلى
            var filesData = [];
            var limit = 800; // الحد المطلوب

            // ابحث عن كل ملفات PDF (أو عدل البحث ليشمل الجميع)
            // ملاحظة: البحث في كامل الدرايف قد يكون بطيئاً، يفضل تحديد مجلد
            var query = "mimeType = 'application/pdf' and trashed = false";
            if (CONFIG.LIBRARY_FOLDER_ID && type === "library") {
                query += " and '" + CONFIG.LIBRARY_FOLDER_ID + "' in parents";
            }

            var files = DriveApp.searchFiles(query);
            var count = 0;

            while (files.hasNext() && count < limit) {
                var file = files.next();
                filesData.push({
                    id: file.getId(),
                    name: file.getName(), // Title
                    date: file.getLastUpdated().toISOString().split('T')[0],
                    size: (file.getSize() / 1024 / 1024).toFixed(2) + " MB",
                    url: file.getUrl(),
                    description: file.getDescription() || "لا يوجد وصف",
                    category: "General" // يمكن تحسين التصنيف
                });
                count++;
            }

            return sendJSON(filesData);
        }

        // 6. تحميل (Proxy)
        if (action === "proxy" && e.parameter.id) {
            try {
                const file = DriveApp.getFileById(e.parameter.id);
                const blob = file.getBlob();
                return ContentService.createTextOutput(JSON.stringify({
                    status: "success",
                    bytes: Utilities.base64Encode(blob.getBytes()),
                    mimeType: blob.getContentType(),
                    name: file.getName()
                })).setMimeType(ContentService.MimeType.JSON);
            } catch (e) {
                return sendJSON({ status: "error", message: "File error" });
            }
        }

        // 7. تحسين: تسجيل مستخدم جديد (Signup)
        if (action === "signup") {
            const email = e.parameter.email;
            const pass = e.parameter.password;
            const name = e.parameter.name;
            if (!email || !pass) return sendJSON({ status: "error", message: "بيانات ناقصة" });

            const sheet = getSheet("Users");
            const usersData = sheet.getDataRange().getValues();

            // التأكد من عدم وجود البريد مسبقاً
            const exists = usersData.some(row => row[0] === email);
            if (exists) return sendJSON({ status: "error", message: "البريد الإلكتروني مسجل مسبقاً!" });

            sheet.appendRow([email, pass, name, new Date(), "individual", email === CONFIG.ADMIN_EMAIL ? "true" : "false"]);
            return sendJSON({ status: "success", message: "تم إنشاء الحساب بنجاح!" });
        }

        // 8. تحسين: تسجيل الدخول (Login)
        if (action === "login") {
            const email = e.parameter.email;
            const pass = e.parameter.password;
            if (!email || !pass) return sendJSON({ status: "error", message: "بيانات ناقصة" });

            const sheet = getSheet("Users");
            const usersData = sheet.getDataRange().getValues();

            const user = usersData.find(row => row[0].toString().toLowerCase() === email.toString().toLowerCase() && row[1].toString() === pass.toString());
            if (user) {
                return sendJSON({
                    status: "success",
                    user: {
                        email: user[0],
                        name: user[2],
                        userType: user[4] || "individual",
                        isAdmin: user[5] === "true" || user[0] === CONFIG.ADMIN_EMAIL
                    }
                });
            } else {
                return sendJSON({ status: "error", message: "البريد أو كلمة المرور غير صحيحة" });
            }
        }

        // 9. الإدارة: جلب قائمة المستخدمين (Admin Only)
        if (action === "admin_get_users") {
            const adminEmail = e.parameter.adminEmail;
            const sheet = getSheet("Users");
            const data = sheet.getDataRange().getValues();

            // تحقق من صلاحية الآدمن
            const admin = data.find(row => row[0] === adminEmail && (row[5] === "true" || row[0] === CONFIG.ADMIN_EMAIL));
            if (!admin) return sendJSON({ status: "error", message: "غير مسموح" });

            const users = data.slice(1).map(row => ({
                email: row[0],
                name: row[2],
                date: row[3],
                userType: row[4] || "individual",
                isAdmin: row[5] === "true"
            }));
            return sendJSON({ status: "success", users: users });
        }

        // 10. الإدارة: تحديث صلاحية مستخدم (Admin Only)
        if (action === "admin_update_user") {
            const adminEmail = e.parameter.adminEmail;
            const targetEmail = e.parameter.targetEmail;
            const newType = e.parameter.userType; // individual or institution
            const newIsAdmin = e.parameter.isAdmin; // true or false

            const sheet = getSheet("Users");
            const data = sheet.getDataRange().getValues();

            const adminIdx = data.findIndex(row => row[0] === adminEmail && (row[5] === "true" || row[0] === CONFIG.ADMIN_EMAIL));
            if (adminIdx === -1) return sendJSON({ status: "error", message: "غير مسموح" });

            const targetIdx = data.findIndex(row => row[0] === targetEmail);
            if (targetIdx === -1) return sendJSON({ status: "error", message: "المستخدم غير موجود" });

            if (newType) sheet.getRange(targetIdx + 1, 5).setValue(newType);
            if (newIsAdmin !== undefined) sheet.getRange(targetIdx + 1, 6).setValue(newIsAdmin.toString());

            return sendJSON({ status: "success", message: "تم التحديث بنجاح" });
        }

        // 11. الإدارة: جلب وتحديث الإعدادات (Admin Only)
        if (action === "admin_config") {
            const adminEmail = e.parameter.adminEmail;
            const sheet = getSheet("Users");
            const data = sheet.getDataRange().getValues();
            const admin = data.find(row => row[0] === adminEmail && (row[5] === "true" || row[0] === CONFIG.ADMIN_EMAIL));
            if (!admin) return sendJSON({ status: "error", message: "غير مسموح" });

            if (e.parameter.method === "set") {
                if (e.parameter.groqKey) PropertiesService.getScriptProperties().setProperty("GROQ_API_KEY", e.parameter.groqKey);
                if (e.parameter.announcement !== undefined) PropertiesService.getScriptProperties().setProperty("SYSTEM_ANNOUNCEMENT", e.parameter.announcement);
                return sendJSON({ status: "success", message: "تم حفظ الإعدادات" });
            } else {
                const groqKey = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY") || CONFIG.GROQ_API_KEY;
                const announcement = PropertiesService.getScriptProperties().getProperty("SYSTEM_ANNOUNCEMENT") || "";
                return sendJSON({ status: "success", groqKey: groqKey, announcement: announcement });
            }
        }

        // 12. جلب الإعلان العام (Public Action)
        if (action === "get_announcement") {
            const announcement = PropertiesService.getScriptProperties().getProperty("SYSTEM_ANNOUNCEMENT") || "";
            return sendJSON({ status: "success", announcement: announcement });
        }

        return sendJSON({ status: "error", message: "Unknown Action: " + action });

    } catch (err) {
        return sendJSON({ status: "error", message: err.toString(), stack: err.stack });
    }
}

// ------------------------------------------
// AI CALLER (GROQ)
// ------------------------------------------
function callGroqAI(userPrompt, systemPrompt, model) {
    let GROQ_API_KEY = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY");

    // Ignore invalid/placeholder properties
    if (!GROQ_API_KEY || GROQ_API_KEY.length < 20 || GROQ_API_KEY.includes(" ")) {
        GROQ_API_KEY = CONFIG.GROQ_API_KEY;
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    if (!GROQ_API_KEY || GROQ_API_KEY.startsWith("gsk_...")) {
        return "BR_ERROR: GROQ_API_KEY is missing or invalid in bridge settings.";
    }

    const payload = {
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 8192 // Increased to handle 30 items + answers
    };

    const options = {
        method: "post",
        headers: {
            "Authorization": "Bearer " + GROQ_API_KEY.trim(),
            "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
        connectTimeout: 60000,
        readTimeout: 60000
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const respCode = response.getResponseCode();
        const text = response.getContentText();

        if (respCode !== 200) {
            return `GROQ_HTTP_ERR_${respCode}: ${text}`;
        }

        const json = JSON.parse(text);
        if (json.choices && json.choices.length > 0) {
            return json.choices[0].message.content;
        } else if (json.error) {
            return "GROQ_API_ERR: " + json.error.message;
        } else {
            return "BR_ERROR: Empty choices in AI response.";
        }
    } catch (e) {
        return "Error calling AI Bridge: " + e.toString();
    }
}

// ------------------------------------------
// HELPERS
// ------------------------------------------
function sendJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSS() {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        if (ss) return ss;
    } catch (e) { }
    try {
        var files = DriveApp.getFilesByName("Athar_Database");
        if (files.hasNext()) return SpreadsheetApp.open(files.next());
    } catch (e) { }
    return SpreadsheetApp.create("Athar_Database");
}

function getSheet(name) {
    var ss = getSS();
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    return sheet;
}

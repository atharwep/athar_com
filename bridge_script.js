
// ==========================================
// ATHAR PLATFORM BRIDGE V4 (FINAL)
// ==========================================

const CONFIG = {
    // مفاتيح الذكاء الاصطناعي (ضع مفاتيحك هنا)
    GROQ_API_KEY: "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",
    GEMINI_API_KEY: "AIza...",

    // مجلدات Google Drive (اختياري - للبحث في مجلدات محددة)
    LIBRARY_FOLDER_ID: "", // ضع معرف مجلد المكتبة هنا إذا وجد
    JOBS_FOLDER_ID: ""    // ضع معرف مجلد الوظائف هنا إذا وجد
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
            return sendJSON({ status: "success", message: "Bridge V4 Online" });
        }

        // 2. معالجة الذكاء الاصطناعي (AI Action)
        if (action === "ai") {
            const prompt = e.parameter.prompt;
            const model = e.parameter.model || "llama-3.3-70b-versatile";
            const systemPrompt = e.parameter.systemPrompt || "You are a helpful assistant.";

            // استدعاء Groq API 
            // (يمكنك استبدال هذا بأي خدمة أخرى)
            const aiResponse = callGroqAI(prompt, systemPrompt, model);
            return ContentService.createTextOutput(aiResponse).setMimeType(ContentService.MimeType.TEXT);
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

        return sendJSON({ status: "error", message: "Unknown Action" });

    } catch (err) {
        return sendJSON({ status: "error", message: err.toString(), stack: err.stack });
    }
}

// ------------------------------------------
// AI CALLER (GROQ)
// ------------------------------------------
function callGroqAI(userPrompt, systemPrompt, model) {
    const GROQ_API_KEY = PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY") || CONFIG.GROQ_API_KEY;
    const url = "https://api.groq.com/openai/v1/chat/completions";

    if (!GROQ_API_KEY || GROQ_API_KEY.startsWith("gsk_...")) {
        return "Error: GROQ_API_KEY is missing. Please set it in Script Properties.";
    }

    const payload = {
        model: model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.7
    };

    const options = {
        method: "post",
        headers: {
            "Authorization": "Bearer " + GROQ_API_KEY,
            "Content-Type": "application/json"
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const json = JSON.parse(response.getContentText());
        if (json.choices && json.choices.length > 0) {
            return json.choices[0].message.content;
        } else {
            return "Error from AI: " + JSON.stringify(json);
        }
    } catch (e) {
        return "Error calling AI: " + e.toString();
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

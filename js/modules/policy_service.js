/**
 * 🧩 Policy Assistant Service (Module)
 * المسؤول عن تحليل ملفات السياسات وتحويلها إلى تعليمات تنفيذية.
 * 
 * المبدأ: Isolation (معزول تماماً عن باقي لاحق النظام)
 */

class PolicyAssistantService {
    constructor() {
        this.bridgeUrl = "https://script.google.com/macros/s/AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w/exec"; // استخدام الجسر الحالي
        this.storageKey = "athar_org_policies";
    }

    /**
     * تحليل ملف سياسة جديد
     * @param {string} textContent - نص السياسة المستخرج (أو النص المباشر)
     * @param {string} role - الدور الوظيفي المستهدف (اختياري)
     */
    async analyzePolicy(textContent, role = "عام") {
        const prompt = `
        أنت خبير حوكمة وسياسات في المنظمات الدولية (Compliance Officer).
        المهمة: تحويل نص السياسة المرفق إلى دليل تنفيذي عملي.
        
        المدخلات:
        - نص السياسة: ${textContent.substring(0, 5000)}... (تم القص للأمان)
        - الدور المستهدف: ${role}

        المطلوب (JSON حصراً):
        {
            "summary": "ملخص تنفيذي للسياسة في سطرين",
            "dos": ["ما يجب فعله 1", "ما يجب فعله 2", "ما يجب فعله 3"],
            "donts": ["ممنوع 1", "ممنوع 2"],
            "risks": ["خطر عدم الالتزام 1", "خطر 2"],
            "checklist": [
                {"item": "خطوة عملية للتطبيق", "critical": true}
            ],
            "role_specific_advice": "نصيحة خاصة لـ ${role}"
        }
        `;

        try {
            const res = await fetch(`${this.bridgeUrl}?action=ai`, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON." }],
                    temperature: 0.3
                })
            });

            const text = await res.text();
            // تنظيف الاستجابة
            const cleanJson = text.replace(/```json\s*|```\s*/gi, "").trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error("فشل في استخراج البيانات من المنظومة الرقمية");

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error("Policy Analysis Error:", error);
            throw error;
        }
    }

    /**
     * حفظ السياسة محلياً (محاكاة قاعدة البيانات)
     */
    savePolicy(policyData) {
        const current = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
        current.push({
            id: Date.now(),
            date: new Date().toISOString(),
            ...policyData
        });
        localStorage.setItem(this.storageKey, JSON.stringify(current));
    }

    getPolicies() {
        return JSON.parse(localStorage.getItem(this.storageKey) || "[]");
    }
}

// تصدير للنافذة العامة
window.PolicyAssistantService = PolicyAssistantService;

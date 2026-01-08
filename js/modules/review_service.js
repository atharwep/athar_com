/**
 * 🧩 Proposal Review Service (Module)
 * خدمة تدقيق ومراجعة المقترحات الداخلية.
 */

class ProposalReviewService {
    constructor() {
        this.bridgeUrl = "https://script.google.com/macros/s/AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w/exec";
        this.storageKey = "athar_internal_reviews";
    }

    async reviewProposal(proposalText, donorName) {
        const prompt = `
        أنت مدقق جودة ومسؤول التزام (Compliance & QA) للمشاريع.
        المهمة: مراجعة مسودة مقترح قبل إرسالها للمانح (${donorName || 'غير محدد'}).
        
        المدخلات:
        "${proposalText.substring(0, 6000)}"

        المطلوب (JSON):
        {
            "score": "85/100",
            "status": "Accepted|Needs Revision|Rejected",
            "critical_flags": ["كلمة محظورة 1", "تناقض في الميزانية"],
            "consistency_check": "هل الأهداف تطابق الأنشطة؟ (نعم/لا مع شرح)",
            "tone_analysis": "هل اللغة مهنية؟ (تحليل موجز)",
            "improvements": [
                {"section": "الجزء المعني", "suggestion": "التحسين المقترح"}
            ],
            "final_verdict": "القرار النهائي"
        }
        `;

        try {
            const res = await fetch(`${this.bridgeUrl}?action=ai`, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON." }],
                    temperature: 0.2 // Low temp for strict analysis
                })
            });

            const text = await res.text();
            const cleanJson = text.replace(/```json\s*|```\s*/gi, "").trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error("AI Parsing Error");

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error("Review Error:", error);
            throw error;
        }
    }
}

window.ProposalReviewService = ProposalReviewService;

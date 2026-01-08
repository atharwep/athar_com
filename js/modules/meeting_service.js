/**
 * 🧩 Meeting Assistant Service (Module)
 * تحويل محاضر الاجتماعات إلى مهام قابلة للتنفيذ.
 */

class MeetingAssistantService {
    constructor() {
        this.bridgeUrl = "https://script.google.com/macros/s/AKfycby0-da3m_iVDFst4K4ha67SzbhC-BJ0bGVrLabj4Eh7Nosr0Jhw3zqsgRDSZiNgw5_1_w/exec";
        this.storageKey = "athar_meeting_minutes";
    }

    async processMeetingNotes(notes) {
        const prompt = `
        أنت مساعد تنفيذي ذكي (Executive Assistant).
        
        المدخلات (محضر اجتماع خام):
        "${notes.substring(0, 6000)}"

        المطلوب (JSON):
        {
            "title": "عنوان مقترح للاجتماع",
            "summary": "ملخص تنفيذي (3-5 نقاط)",
            "decisions": ["قرار 1", "قرار 2"],
            "action_items": [
                {"task": "المهمة", "assignee": "المسؤول (إن وجد)", "deadline": "الموعد (إن وجد)", "priority": "High/Medium/Low"}
            ],
            "next_meeting": "مقترح للاجتماع القادم (أجندة مقترحة)"
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
            const cleanJson = text.replace(/```json\s*|```\s*/gi, "").trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error("AI Parsing Error");

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            console.error("Meeting Processing Error:", error);
            throw error;
        }
    }
}

window.MeetingAssistantService = MeetingAssistantService;

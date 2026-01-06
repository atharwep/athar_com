document.addEventListener('DOMContentLoaded', () => {
    // State Management (Local to this module)
    let state = {};

    // Helper: Status Logger
    function logStatus(type, msg) {
        const el = document.getElementById('statusLog');
        if (el) {
            el.innerText = msg;
            el.className = `status-${type}`;
        }
        console.log(`[${type}] ${msg}`);
    }

    // الإعدادات الافتراضية
    const BRIDGE_URL = "https://script.google.com/macros/s/AKfycbyJ0h6WymswhfwgB0-zylCW9YfDknGE7oXR2QQE8QlonM36Tw7qCAH-_szOIE2XpaW0eg/exec";
    const DEFAULT_CONFIG = {
        provider: 'groq',
        geminiKey: "",
        groqKey: "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",
        bridgeUrl: BRIDGE_URL
    };

    let savedConfig = JSON.parse(localStorage.getItem('athar_ai_config') || '{}');
    let config = { ...DEFAULT_CONFIG, ...savedConfig };

    if (!config.bridgeUrl) config.bridgeUrl = DEFAULT_CONFIG.bridgeUrl;

    async function generateFullProposal() {
        if (!state.selectedIdea) return alert("الرجاء اختيار فكرة مشروع أولاً");

        const selected = state.selectedIdea;
        document.getElementById('step3').innerHTML = `
            <div class="glass-card" style="text-align:center; padding:40px;">
                <div class="spinner"></div>
                <h3 style="color:var(--primary);">جاري صياغة المقترح الكامل والشامل...</h3>
                <p>يتم الآن بناء السياق وتحليل المشكلة بناءً على الموقع الجغرافي المحدد.</p>
            </div>`;

        const currentLang = localStorage.getItem('athar_language') || 'ar';
        const targetLang = currentLang === 'ar' ? 'Arabic' : 'English';

        // الموقع الجغرافي التفصيلي
        const location = `الدولة: ${state.projectInfo.country}, المحافظة: ${state.projectInfo.governorate}, القرية/الحي: ${state.projectInfo.village || 'غير محدد'}`;

        const prompt = `
        # 🔷 برومت كتابة مقترح مشروع احترافي ومطوّر
        أنت خبير دولي متخصص في تصميم وكتابة وتقييم مقترحات المشاريع للمنظمات غير الحكومية وغير الربحية.

        ## السياق الجغرافي:
        ${location}

        ## فكرة المشروع المبدئية:
        العنوان: ${selected.name}
        الوصف: ${selected.desc || selected.description}
        الميزانية: ${state.projectInfo.budget}$
        المدة: ${state.projectInfo.duration} شهر

        ## المطلوب صياغته (JSON حصراً):
        يجب أن يكون المقترح متوافقاً مع المعايير الدولية الإنسانية (مثل معايير اسفير والعمل القائم على النتائج).

        {
            "title": "${selected.name}",
            "location_details": "توصيف دقيق للموقع الجغرافي المستهدف وأهميته",
            "population_info": "إحصائيات تقديرية للسكان في ${state.projectInfo.governorate} و ${state.projectInfo.village || ''} ونسبة الفئات الهشة",
            "rationale": "المبرر (400 كلمة كحد أقصى): وصف المشكلة في هذا الموقع تحديداً، الفئات المتضررة، والارتباط بالسياسات الوطنية",
            "target_groups": "الفئات المستفيدة (250 كلمة): الأعداد والأنواع (نازحون، مقيمون، أطفال، نساء...)",
            "methodology": "النهج المقترح (400 كلمة): كيف سيعالج المشروع المشكلة في هذا السياق الجغرافي",
            "gender_equity": "النوع الاجتماعي والإنصاف (250 كلمة): الإجراءات المحددة لضمان الشمولية",
            "advantage": "الميزة التنافسية (250 كلمة): لماذا تعتبر هذه المنظمة هي الأنسب للتنفيذ في هذا الموقع",
            "risk_management": "إدارة المخاطر (250 كلمة): المخاطر المحتملة في ${state.projectInfo.governorate} وإجراءات التخفيف",
            "results_framework": [
                {
                    "output": "مخرج رئيسي 1",
                    "indicators": "مؤشرات الأداء (خط الأساس، الغاية، وسائل التحقق)",
                    "activities": ["نشاط 1.1", "نشاط 1.2"],
                    "budget_est": "ميزانية تقديرية للمخرج"
                }
            ],
            "sustainability": "خطة الاستدامة (250 كلمة): كيف سيستمر الأثر بعد انتهاء الميزانية"
        }

        اللغة: ${targetLang}.
        ملاحظة: لا تذكر كلمة "اليونيسيف" مطلقاً، اجعل المقترح عاماً واحترافياً لأي مانح دولي.
        `;

        try {
            const res = await AIGateway.call(prompt);
            const jsonMatch = res.match(/\{[\s\S]*\}/);
            const data = JSON.parse(jsonMatch ? jsonMatch[0] : res);

            state.proposal = data;

            let html = `
                <div class="glass-card" id="finalPreview" style="font-family:'Cairo', sans-serif; padding:40px; background:white; color:#333; direction:${currentLang === 'ar' ? 'rtl' : 'ltr'};">
                    <div style="text-align:center; border: 2px solid var(--primary); padding:20px; margin-bottom:30px; border-radius:10px;">
                        <h1 style="margin:0; color:var(--primary);">${data.title}</h1>
                        <p style="font-weight:bold; color:#666; margin-top:10px;">مقترح مشروع إنساني متكامل - منصة أثر</p>
                        <p style="font-size:0.9rem;">الموقع: ${location}</p>
                    </div>

                    <div class="proposal-section" style="margin-bottom:30px;">
                        <h3 style="background:var(--primary); color:white; padding:10px 20px; border-radius:5px;">1. معلومات الموقع والفئات المستهدفة</h3>
                        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
                            <tr><td style="border:1px solid #ddd; padding:10px; background:#f9f9f9; width:30%;"><strong>التغطية الجغرافية</strong></td><td style="border:1px solid #ddd; padding:10px;">${data.location_details}</td></tr>
                            <tr><td style="border:1px solid #ddd; padding:10px; background:#f9f9f9;"><strong>التركيز السكاني</strong></td><td style="border:1px solid #ddd; padding:10px;">${data.population_info}</td></tr>
                            <tr><td style="border:1px solid #ddd; padding:10px; background:#f9f9f9;"><strong>الفئات المستفيدة</strong></td><td style="border:1px solid #ddd; padding:10px;">${data.target_groups}</td></tr>
                        </table>
                    </div>

                    <div class="proposal-section" style="margin-bottom:30px;">
                        <h3 style="background:var(--primary); color:white; padding:10px 20px; border-radius:5px;">2. المبرر وتحليل المشكلة</h3>
                        <div style="background:#fcfcfc; padding:15px; border-right:4px solid var(--primary); text-align:justify; line-height:1.8;">
                            ${data.rationale}
                        </div>
                    </div>

                    <div class="proposal-section" style="margin-bottom:30px;">
                        <h3 style="background:var(--primary); color:white; padding:10px 20px; border-radius:5px;">3. المنهجية والنهج المقترح</h3>
                        <p style="line-height:1.8;">${data.methodology}</p>
                    </div>

                    <div class="proposal-section" style="margin-bottom:30px;">
                        <h3 style="background:var(--primary); color:white; padding:10px 20px; border-radius:5px;">4. النوع الاجتماعي والإنصاف</h3>
                        <p>${data.gender_equity}</p>
                    </div>

                    <div class="proposal-section" style="margin-bottom:30px;">
                        <h3 style="background:var(--primary); color:white; padding:10px 20px; border-radius:5px;">5. إدارة المخاطر والاستدامة</h3>
                        <p><strong>تحليل المخاطر:</strong> ${data.risk_management}</p>
                        <hr style="margin:15px 0; border:0; border-top:1px solid #eee;">
                        <p><strong>رؤية الاستدامة:</strong> ${data.sustainability}</p>
                    </div>

                    <div class="proposal-section">
                        <h3 style="background:var(--primary); color:white; padding:10px 20px; border-radius:5px;">6. إطار عمل النتائج والأنشطة</h3>
                        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                            <tr style="background:#eee;">
                                <th style="border:1px solid #ddd; padding:10px;">المخرج</th>
                                <th style="border:1px solid #ddd; padding:10px;">المؤشرات</th>
                                <th style="border:1px solid #ddd; padding:10px;">الأنشطة</th>
                            </tr>
                            ${data.results_framework.map(rf => `
                                <tr>
                                    <td style="border:1px solid #ddd; padding:10px; vertical-align:top;"><strong>${rf.output}</strong></td>
                                    <td style="border:1px solid #ddd; padding:10px; vertical-align:top; font-size:0.9rem;">${rf.indicators}</td>
                                    <td style="border:1px solid #ddd; padding:10px; vertical-align:top;">
                                        <ul style="padding-right:20px; margin:0;">${rf.activities.map(a => `<li>${a}</li>`).join('')}</ul>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
                <div style="margin-top:20px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <button id="saveProjectBtn" class="btn btn-secondary">💾 حفظ المسودة</button>
                    <button id="exportWordBtn" class="btn btn-primary">📄 تصدير المقترح (Word)</button>
                    <button onclick="location.reload()" class="btn btn-ghost">جديد ↺</button>
                </div>`;

            document.getElementById('step3').innerHTML = html;
            attachExportListeners();
        } catch (e) {
            console.error(e);
            document.getElementById('step3').innerHTML = `<div class="glass-card" style="color:red; text-align:center;"><h3>حدث خطأ في صياغة المقترح</h3><p>${e.message}</p></div>`;
        }
    }

    function attachExportListeners() {
        const exportWordBtn = document.getElementById('exportWordBtn');
        if (exportWordBtn) {
            exportWordBtn.onclick = () => {
                ProtectionManager.verify(() => {
                    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #000; padding: 5px; } h3 { background: #10b981; color: white; padding: 5px; }</style></head><body>`;
                    const content = document.getElementById("finalPreview").innerHTML;
                    const blob = new Blob(['\ufeff', header + content + "</body></html>"], { type: 'application/msword' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `مقترح_${state.selectedIdea?.name || 'مشروع'}.doc`;
                    link.click();
                });
            };
        }

        const saveBtn = document.getElementById('saveProjectBtn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const saved = JSON.parse(localStorage.getItem('athar_saved_projects') || '[]');
                saved.push({ id: Date.now(), date: new Date().toLocaleDateString('ar-EG'), ...state });
                localStorage.setItem('athar_saved_projects', JSON.stringify(saved));
                alert("تم الحفظ بنجاح 💾");
            };
        }
    }

    const AIGateway = {
        async call(prompt) {
            logStatus('loading', '(يتم التصميم الآن...)');
            return await this.callBridge(prompt);
        },
        async callBridge(prompt) {
            const payload = { model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.7 };
            try {
                const res = await fetch(config.bridgeUrl + "?action=ai", {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                return data.choices?.[0]?.message?.content || null;
            } catch (e) { this.handleError(e.message); return null; }
        },
        handleError(msg) { logStatus('err', '(خطأ في الاتصال)'); alert(`خطأ: ${msg}`); }
    };

    const goToStep = (n) => {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`step${n}`).classList.add('active');
        if (n > 1) document.querySelector('.hero-section')?.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.onclick = async () => {
            const idea = document.getElementById('projectIdea').value;
            const b = document.getElementById('projectBudget').value;
            const d = document.getElementById('projectDuration').value;
            const c = document.getElementById('country').value;
            const g = document.getElementById('governorate').value;
            const v = document.getElementById('village').value;

            if (!idea) return alert("يرجى إدخال فكرة المشروع");
            if (!g) return alert("يرجى إدخال المحافظة المستهدفة");

            analyzeBtn.disabled = true;
            state.projectInfo = { idea, budget: b, duration: d, country: c, governorate: g, village: v };

            const prompt = `حلل الفكرة "${idea}" في موقع "${c} - ${g} - ${v}". أعطِ قطاعاً (Sector) وملخصاً ذكياً. JSON: { "sector": "...", "summary": "..." } بالعربية.`;
            const res = await AIGateway.call(prompt);
            if (res) {
                const data = JSON.parse(res.match(/\{[\s\S]*\}/)[0]);
                state.analysis = data;
                document.getElementById('analysisResult').innerHTML = `
                    <div class="glass-card" style="padding:20px; border:2px solid var(--primary);">
                        <h3 style="color:var(--primary);">${data.sector}</h3>
                        <p>${data.summary}</p>
                        <button id="nextBtn" class="btn btn-primary" style="width:100%;">استمرار ✨</button>
                    </div>`;
                document.getElementById('analysisResult').style.display = 'block';
                document.getElementById('nextBtn').onclick = () => { generateIdeas(); goToStep(2); };
            }
            analyzeBtn.disabled = false;
        };
    }

    async function generateIdeas() {
        document.getElementById('ideasGrid').innerHTML = '<p style="text-align:center">جاري توليد أفكار ريادية...</p>';
        const prompt = `اقترح 4 أفكار مشاريع لـ: ${state.analysis.summary} في ${state.projectInfo.governorate} بميزانية ${state.projectInfo.budget}. JSON Array: [ {"name":"...", "description":"..."} ] بالعربية.`;
        const res = await AIGateway.call(prompt);
        if (res) {
            const data = JSON.parse(res.match(/\[[\s\S]*\]/)[0]);
            const grid = document.getElementById('ideasGrid');
            grid.innerHTML = '';
            data.forEach(idea => {
                const card = document.createElement('div'); card.className = 'glass-card idea-card'; card.style.padding = '15px';
                card.innerHTML = `<h4 style="color:var(--primary);">${idea.name}</h4><p>${idea.description}</p>`;
                card.onclick = () => {
                    document.querySelectorAll('.idea-card').forEach(c => c.style.borderColor = 'var(--glass-border)');
                    card.style.borderColor = 'var(--primary)'; state.selectedIdea = idea;
                    document.getElementById('generateProposalBtn').disabled = false;
                };
                grid.appendChild(card);
            });
        }
    }

    const generateProposalBtn = document.getElementById('generateProposalBtn');
    if (generateProposalBtn) {
        generateProposalBtn.onclick = () => { goToStep(3); generateFullProposal(); };
    }

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const isDark = document.body.classList.toggle('dark-theme');
            localStorage.setItem('athar_theme', isDark ? 'dark' : 'light');
        };
    }
});

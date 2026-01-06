/**
 * Athar Platform Protection Script
 * 1. Disables copying and text selection.
 * 2. Handles Activation Code Verification for downloads (Strict One-Time Use).
 */

// Disable Selection and Copying
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('selectstart', event => event.preventDefault());
document.addEventListener('keydown', event => {
    // Disable Ctrl+C, Ctrl+U, Ctrl+S, F12
    if (event.ctrlKey && (event.key === 'c' || event.key === 'u' || event.key === 's' || event.key === 'p')) {
        event.preventDefault();
    }
    if (event.keyCode === 123) { // F12
        event.preventDefault();
    }
});

// Activation Verification Logic
const ProtectionManager = {
    isVerified: false,
    currentCallback: null,
    currentId: 0,
    storageKey: 'athar_activation',

    init() {
        this.showSecurityGate();
        this.createModal();
    },

    showSecurityGate() {
        if (sessionStorage.getItem('athar_gate_passed')) return;

        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const result = num1 + num2;

        const gateHtml = `
            <div id="atharSecurityGate" style="position:fixed; top:0; left:0; width:100%; height:100%; background:#0f172a; z-index:20000; display:flex; align-items:center; justify-content:center; font-family:'Cairo', sans-serif; direction:rtl; color:white;">
                <div style="background:#1e293b; padding:40px; border-radius:24px; text-align:center; max-width:400px; width:90%; border:1px solid rgba(255,255,255,0.1); box-shadow:0 25px 50px rgba(0,0,0,0.5);">
                    <div style="font-size:3rem; margin-bottom:20px;">🛡️</div>
                    <h2 style="margin:0 0 10px 0; font-weight:900;">تحقق الأمان</h2>
                    <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:25px;">يرجى حل هذه المسألة البسيطة للوصول إلى المنصة:</p>
                    
                    <div style="background:#0f172a; padding:20px; border-radius:15px; margin-bottom:20px; font-size:1.5rem; font-weight:bold; letter-spacing:5px;">
                        ${num1} + ${num2} = ?
                    </div>
                    
                    <input type="number" id="gateAnswer" placeholder="أدخل الناتج هنا" style="width:100%; padding:15px; border-radius:12px; border:1px solid #334155; background:#0f172a; color:white; text-align:center; font-size:1.2rem; margin-bottom:20px; outline:none; transition:0.3s;">
                    
                    <button onclick="ProtectionManager.verifyGate(${result})" style="width:100%; padding:15px; background:#4f46e5; color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:1.1rem; transition:0.3s;">دخول للمنصة 🚀</button>
                    
                    <p style="margin-top:20px; font-size:0.75rem; color:#64748b;">هذه الخطوة تضمن حماية البيانات البرمجية والتقارير من الفحص الآلي.</p>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.id = 'atharGateWrapper';
        div.innerHTML = gateHtml;
        document.body.appendChild(div);

        // Disable scrolling while gate is active
        document.body.style.overflow = 'hidden';
    },

    verifyGate(correct) {
        const input = document.getElementById('gateAnswer');
        if (parseInt(input.value) === correct) {
            sessionStorage.setItem('athar_gate_passed', 'true');
            const wrapper = document.getElementById('atharGateWrapper');
            if (wrapper) wrapper.remove();
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        } else {
            alert("❌ الناتج غير صحيح، يرجى المحاولة مرة أخرى.");
            input.value = '';
            input.focus();
        }
    },

    generateNewId() {
        this.currentId = Math.floor(1000 + Math.random() * 9000);

        // Update UI elements
        const idNode = document.getElementById('atharProcessId');
        if (idNode) idNode.innerText = this.currentId;

        const waNode = document.getElementById('atharWaBtn');
        if (waNode) {
            // Update WhatsApp link (keep user friendly text)
            // But now the verification is automated (ID + 2025)
            // We can perhaps hint the user or keep it as backup.
            const msg = `أرغب في تفعيل ميزة في منصة أثر.\nكود العملية الفريد: ${this.currentId}\nيرجى تزويدي بكود التفعيل.`;
            waNode.href = `https://wa.me/963936020439?text=${encodeURIComponent(msg)}`;
        }

        // 🚀 AUTO-UPLOAD TO SHEET (As requested)
        // Fire and forget (or log error silently)
        try {
            const BRIDGE_URL = "https://script.google.com/macros/s/AKfycbyJ0h6WymswhfwgB0-zylCW9YfDknGE7oXR2QQE8QlonM36Tw7qCAH-_szOIE2XpaW0eg/exec";
            fetch(`${BRIDGE_URL}?action=registerId&id=${this.currentId}`, { mode: 'no-cors' }) // no-cors for speed and to avoid errors if simple trigger
                .catch(e => console.log("Bg register failed", e));
        } catch (e) {
            console.log("Register error", e);
        }
    },

    createModal() {
        if (document.getElementById('atharAuthModal')) return;

        const modalHtml = `
            <div id="atharAuthModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; backdrop-filter:blur(10px); align-items:center; justify-content:center; font-family:'Cairo', sans-serif; direction:rtl;">
                <div style="background:#ffffff; border:none; border-radius:28px; padding:35px; max-width:480px; width:92%; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); color:#1f2937; overflow:hidden;">
                    <button onclick="ProtectionManager.closeModal()" style="position:absolute; top:20px; left:20px; background:#f3f4f6; border:none; width:35px; height:35px; border-radius:50%; font-size:1.2rem; cursor:pointer; color:#4b5563; display:flex; align-items:center; justify-content:center; transition:0.2s;">✕</button>
                    
                    <div style="text-align:center; margin-bottom:25px;">
                        <span style="font-size:3.5rem; display:block; margin-bottom:10px;">💎</span>
                        <h2 style="margin:0; color:#4f46e5; font-size:1.8rem; font-weight:900;">ميزة مدفوعة</h2>
                        <p style="color:#6b7280; font-size:1rem; margin-top:8px;">لتصدير البيانات وتحميل الملفات، يرجى تفعيل النسخة الكاملة.</p>
                    </div>

                    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:20px; padding:20px; margin-bottom:25px;">
                        <h4 style="margin:0 0 12px 0; color:#1f2937; font-weight:700; border-right:4px solid #4f46e5; padding-right:10px;">طريقة التفعيل السريع:</h4>
                        <ul style="margin:0; padding:0 20px 0 0; font-size:0.95rem; line-height:1.7; color:#374151;">
                            <li>تحويل مبلغ <b style="color:#4f46e5;">25,000 ل.س</b> (شام كاش).</li>
                            <li>كود العملية الحالي: <b id="atharProcessId" style="color:#4f46e5; font-size:1.1rem; background:#eef2ff; padding:2px 8px; border-radius:6px; letter-spacing:1px;">----</b></li>
                            <li>تواصل معنا لتلقي كود التفعيل الخاص بك فوراً.</li>
                        </ul>
                        <div style="margin-top:18px; text-align:center;">
                            <a id="atharWaBtn" href="#" target="_blank" style="display:inline-flex; align-items:center; gap:10px; background:#22c55e; color:white; padding:12px 24px; border-radius:14px; text-decoration:none; font-weight:bold; font-size:1rem; box-shadow:0 4px 12px rgba(34,197,94,0.3); transition:0.3s;">
                                تواصل عبر واتساب 💬
                            </a>
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <input type="text" id="activationCodeInput" placeholder="أدخل الكود هنا..." style="width:100%; padding:16px; border-radius:14px; border:2px solid #e5e7eb; background:#f9fafb; color:#111827; text-align:center; font-weight:bold; font-size:1.2rem; letter-spacing:3px; outline:none; transition:0.2s;">
                    </div>

                    <button id="verifyBtnAction" onclick="ProtectionManager.handleVerify()" style="width:100%; padding:16px; background:#4f46e5; color:white; border:none; border-radius:14px; font-weight:900; cursor:pointer; font-size:1.2rem; box-shadow:0 10px 15px -3px rgba(79,70,229,0.3); transition:0.3s;">تفعيل الآن ✅</button>
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #f3f4f6; text-align:center; font-size:0.85rem; color:#059669; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:5px;">
                        🛡️ ضمان استرداد الأموال بالكامل في حالات الخلل التقني.
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div);
    },

    verify(callback) {
        this.currentCallback = callback;
        const modal = document.getElementById('atharAuthModal');
        if (modal) {
            this.generateNewId(); // Generate fresh ID every time (Dynamic)
            modal.style.display = 'flex';
        }
    },

    async handleVerify() {
        const input = document.getElementById('activationCodeInput');
        const btn = document.getElementById('verifyBtnAction');
        const code = input.value.trim();

        if (!code) return alert("يرجى إدخال الكود");

        try {
            btn.disabled = true;
            btn.innerText = "جاري التحقق...⏳";

            const BRIDGE_URL = "https://script.google.com/macros/s/AKfycbyJ0h6WymswhfwgB0-zylCW9YfDknGE7oXR2QQE8QlonM36Tw7qCAH-_szOIE2XpaW0eg/exec";
            const pageName = document.title || window.location.pathname;

            // Strict Server Verification
            const res = await fetch(`${BRIDGE_URL}?action=verifyCode&code=${encodeURIComponent(code)}&id=${this.currentId}&page=${encodeURIComponent(pageName)}`);
            const data = await res.json();

            if (data.status === "success") {
                // Save locally
                localStorage.setItem(this.storageKey, JSON.stringify({
                    id: this.currentId,
                    code: code,
                    date: new Date().toISOString(),
                    verified: true
                }));

                this.closeModal();
                alert("✅ تم التفعيل بنجاح! شكراً لك.");

                if (this.currentCallback) this.currentCallback();
            } else {
                alert("❌ " + (data.message || "كود غير صالح أو مستخدم مسبقاً"));
            }
        } catch (e) {
            console.error(e);
            if (e.message.includes("Failed to fetch")) {
                alert("❌ خطأ في الاتصال بالسيرفر!\n\nالأسباب المحتملة:\n1- السكريبت غير منشور بصلاحية 'Anyone' (أي شخص).\n2- توجد مشكلة في الإنترنت.\n3- إضافة حظر الإعلانات تمنع الاتصال.");
            } else {
                alert("❌ حدث خطأ: " + e.message);
            }

            btn.disabled = false;
            btn.innerText = "تحقق من الكود 🔓";
        }
    },

    closeModal() {
        document.getElementById('atharAuthModal').style.display = 'none';
        this.currentCallback = null;
        if (document.getElementById('activationCodeInput')) {
            document.getElementById('activationCodeInput').value = '';
        }
    }
};

window.onload = () => ProtectionManager.init();
window.ProtectionManager = ProtectionManager;

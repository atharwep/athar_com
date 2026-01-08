(function () {
    const publicPages = ['auth.html', '404.html'];
    const institutionPages = [
        'org_policies.html',
        'org_review.html',
        'org_meetings.html',
        'org_profile.html',
        'ops_dashboard.html'
    ];
    const adminPages = ['admin_console.html'];

    // الحصول على اسم الصفحة وتجريدها من أي استعلامات (Query Strings) أو بارامترات
    const path = window.location.pathname;
    let page = path.split('/').pop() || 'index.html';
    page = page.split('?')[0].split('#')[0]; // تأمين اسم الصفحة فقط (مثل: index.html)

    if (publicPages.includes(page)) return;

    const userRaw = localStorage.getItem('athar_user');
    if (!userRaw) {
        window.location.href = 'auth.html';
        return;
    }

    const user = JSON.parse(userRaw);

    // التحقق من حالة المطور (بكل الصيغ الممكنة بولين أو نص)
    const isAdmin = user.isAdmin === true || user.isAdmin === "true";
    const isInstitution = user.userType === 'institution' || isAdmin;

    // 1. التحقق من صفحات الإدارة
    if (adminPages.includes(page)) {
        if (!isAdmin) {
            alert("⛔ عذراً، هذه الصفحة مخصصة للمطورين فقط.");
            window.location.href = 'index.html';
            return;
        }
    }

    // 2. التحقق من صفحات المؤسسات
    if (institutionPages.includes(page) && !isInstitution) {
        showInstitutionNotice();
    }
})();

function showInstitutionNotice() {
    if (document.getElementById('institutionBarrier')) return;

    const overlay = document.createElement('div');
    overlay.id = 'institutionBarrier';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.98); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(15px);
    `;

    overlay.innerHTML = `
        <div style="background: white; padding: 45px; border-radius: 30px; text-align: center; max-width: 480px; width: 90%; border: 4px solid #6366f1; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="font-size: 4.5rem; margin-bottom: 20px;">🏢</div>
            <h2 style="color: #0f172a; margin-bottom: 15px; font-weight: 900; font-family: 'Cairo', sans-serif;">ميزة مؤسساتية حصرية</h2>
            <p style="color: #475569; line-height: 1.8; margin-bottom: 30px; font-size: 1.1rem; font-family: 'Cairo', sans-serif;">
                أهلاً بك! تتوفر هذه الأدوات المتقدمة حصرياً لشركائنا من المؤسسات والمنظمات النوعية.
                <br><b>للترقية والوصول الفوري، يرجى تفعيل حسابك المؤسساتي.</b>
            </p>
            <a href="https://wa.me/963936020439" target="_blank" style="display: block; background: #22c55e; color: white; text-decoration: none; padding: 18px; border-radius: 20px; font-weight: bold; margin-bottom: 15px; font-size: 1.1rem; font-family: 'Cairo', sans-serif;">
                تفعيل حساب مؤسساتي الآن 💬
            </a>
            <a href="index.html" style="color: #6366f1; text-decoration: none; font-weight: bold; font-family: 'Cairo', sans-serif; display: inline-block; margin-top: 10px;">العودة بسلام للرئيسية</a>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function logout() {
    localStorage.removeItem('athar_user');
    window.location.href = 'auth.html';
}

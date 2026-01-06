// دالة لإخفاء الحقول الفارغة
function filterEmptyFields(data) {
    return {
        personal: data.personal,
        education: (data.education || []).filter(e => e.school && e.degree),
        experience: (data.experience || []).filter(e => e.org && e.title && e.tasks && e.tasks.length > 0),
        skills: (data.skills || []).filter(s => s && s.trim()),
        languages: data.languages,
        computer: (data.computer || []).filter(c => c.program && c.level),
        courses: (data.courses || []).filter(c => c.name && c.org),
        references: (data.references || []).filter(r => r.name && (r.phone || r.email))
    };
}

// قوالب السيرة الذاتية المتعددة
const CVTemplates = {
    // القالب الكلاسيكي - تصميم تقليدي مع جداول
    classic: (data) => {
        const filtered = filterEmptyFields(data);
        const coverLetter = generateCoverLetter(data);

        let html = `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; color:#333; line-height: 1.8; max-width: 800px; margin: auto;">
            <div style="text-align:center; border-bottom: 3px solid #2563eb; padding-bottom:15px; margin-bottom:25px;">
                <h1 style="margin:0; color:#2563eb; font-size:2rem;">${data.personal.name}</h1>
                <p style="margin:8px 0; font-size:0.95rem;">${data.personal.address} | ${data.personal.phone} | ${data.personal.email}</p>
                <p style="font-size:0.85rem; color:#666;">الجنسية: ${data.personal.nationality} | تاريخ الولادة: ${data.personal.dob} | الجنس: ${data.personal.gender}</p>
            </div>`;

        // المؤهلات العلمية - فقط إذا كانت موجودة
        if (filtered.education.length > 0) {
            html += `
            <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin:25px 0 15px 0;">المؤهلات العلمية</h3>
            <table style="width:100%; border-collapse:collapse; margin-bottom:25px;">
                <tr style="background:#f8fafc;">
                    <th style="border:1px solid #ddd; padding:10px; text-align:center;">المؤسسة</th>
                    <th style="border:1px solid #ddd; padding:10px; text-align:center;">الشهادة / التخصص</th>
                </tr>
                ${filtered.education.map(e => `<tr><td style="border:1px solid #ddd; padding:10px;">${e.school}</td><td style="border:1px solid #ddd; padding:10px;">${e.degree}</td></tr>`).join('')}
            </table>`;
        }

        // الخبرات العملية - فقط إذا كانت موجودة
        if (filtered.experience.length > 0) {
            html += `
            <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin:25px 0 15px 0;">الخبرات العملية</h3>
            ${filtered.experience.map(e => `
                <div style="margin-bottom:20px; padding:15px; border:1px solid #e5e7eb; border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <strong style="color:#2563eb; font-size:1.1rem;">${e.title}</strong>
                        <span style="color:#666;">${e.date}</span>
                    </div>
                    <div style="font-style:italic; color:#666; margin-bottom:10px;">${e.org}</div>
                    <ul style="margin:0; padding-right:20px;">
                        ${e.tasks.map(t => `<li style="margin-bottom:5px;">${t}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}`;
        }

        // المهارات - فقط إذا كانت موجودة
        if (filtered.skills.length > 0) {
            html += `
            <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin:25px 0 15px 0;">المهارات الشخصية</h3>
            <ul style="padding-right:20px; columns:2; column-gap:20px;">
                ${filtered.skills.map(s => `<li style="margin-bottom:8px;">${s}</li>`).join('')}
            </ul>`;
        }

        // اللغات ومهارات الكمبيوتر
        html += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-top:25px;">`;

        if (filtered.languages.ar || filtered.languages.en) {
            html += `
                <div>
                    <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin-bottom:15px;">اللغات</h3>
                    <p style="padding:0 10px; line-height:1.8;">العربية: ${filtered.languages.ar}<br>الإنجليزية: ${filtered.languages.en}</p>
                </div>`;
        }

        if (filtered.computer.length > 0) {
            html += `
                <div>
                    <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin-bottom:15px;">مهارات الكمبيوتر</h3>
                    <table style="width:100%; border-collapse:collapse;">
                        ${filtered.computer.map(c => `<tr><td style="border:1px solid #ddd; padding:8px;">${c.program}</td><td style="border:1px solid #ddd; padding:8px;">${c.level}</td></tr>`).join('')}
                    </table>
                </div>`;
        }

        html += `</div>`;

        // الدورات التدريبية - فقط إذا كانت موجودة
        if (filtered.courses.length > 0) {
            html += `
            <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin:25px 0 15px 0;">الدورات التدريبية</h3>
            <ul style="padding-right:20px;">
                ${filtered.courses.map(c => `<li style="margin-bottom:8px;">${c.name} - ${c.org}</li>`).join('')}
            </ul>`;
        }

        // المراجع - فقط إذا كانت موجودة
        if (filtered.references.length > 0) {
            html += `
            <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin:25px 0 15px 0;">المراجع</h3>
            <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f8fafc;">
                    <th style="border:1px solid #ddd; padding:10px;">الاسم</th>
                    <th style="border:1px solid #ddd; padding:10px;">الهاتف</th>
                    <th style="border:1px solid #ddd; padding:10px;">البريد الإلكتروني</th>
                </tr>
                ${filtered.references.map(r => `<tr><td style="border:1px solid #ddd; padding:10px;">${r.name}</td><td style="border:1px solid #ddd; padding:10px;">${r.phone || '-'}</td><td style="border:1px solid #ddd; padding:10px;">${r.email || '-'}</td></tr>`).join('')}
            </table>`;
        }

        // خطاب التقديم
        html += `
            <h3 style="background:#f1f5f9; padding:10px; border-right:5px solid #2563eb; margin:25px 0 15px 0;">خطاب التقديم</h3>
            <div style="padding:20px; background:#f9fafb; border-radius:8px; line-height:2;">
                ${coverLetter.replace(/\n/g, '<br>')}
            </div>
        </div>`;

        return html;
    },

    // القالب العصري - تصميم حديث مع ألوان
    modern: (data) => {
        const coverLetter = generateCoverLetter(data);

        return `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; color:#1f2937; line-height: 1.8; max-width: 800px; margin: auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:40px; text-align:center; border-radius:15px 15px 0 0; margin-bottom:30px;">
                <h1 style="margin:0; font-size:2.5rem; font-weight:900;">${data.personal.name}</h1>
                <p style="margin:15px 0 0 0; font-size:1.1rem; opacity:0.95;">${data.personal.address}</p>
                <p style="margin:8px 0 0 0; opacity:0.9;">${data.personal.phone} | ${data.personal.email}</p>
            </div>

            <div style="padding:0 30px;">
                <div style="background:#f3f4f6; padding:20px; border-radius:10px; margin-bottom:25px;">
                    <h3 style="color:#667eea; margin:0 0 10px 0; font-size:1.3rem;">📚 المؤهلات العلمية</h3>
                    ${data.education.map(e => `
                        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:10px; border-right:4px solid #667eea;">
                            <strong style="color:#1f2937;">${e.degree}</strong>
                            <div style="color:#6b7280; margin-top:5px;">${e.school}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-bottom:25px;">
                    <h3 style="color:#667eea; margin:0 0 15px 0; font-size:1.3rem; border-bottom:3px solid #667eea; padding-bottom:10px;">💼 الخبرات العملية</h3>
                    ${data.experience.map(e => `
                        <div style="background:#f9fafb; padding:20px; border-radius:10px; margin-bottom:15px; border:2px solid #e5e7eb;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <h4 style="margin:0; color:#667eea; font-size:1.2rem;">${e.title}</h4>
                                <span style="background:#667eea; color:white; padding:5px 15px; border-radius:20px; font-size:0.85rem;">${e.date}</span>
                            </div>
                            <div style="color:#6b7280; font-weight:600; margin-bottom:10px;">${e.org}</div>
                            <ul style="margin:0; padding-right:20px; color:#4b5563;">
                                ${e.tasks.map(t => `<li style="margin-bottom:6px;">${t}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>

                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding:25px; border-radius:10px; margin-bottom:25px;">
                    <h3 style="color:white; margin:0 0 15px 0; font-size:1.3rem;">✨ المهارات الشخصية</h3>
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
                        ${data.skills.map(s => `<div style="background:rgba(255,255,255,0.2); color:white; padding:10px; border-radius:8px; font-weight:600;">${s}</div>`).join('')}
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:25px;">
                    <div style="background:#fef3c7; padding:20px; border-radius:10px;">
                        <h3 style="color:#d97706; margin:0 0 15px 0;">🌍 اللغات</h3>
                        <p style="margin:0; line-height:2;"><strong>العربية:</strong> ${data.languages.ar}<br><strong>الإنجليزية:</strong> ${data.languages.en}</p>
                    </div>
                    <div style="background:#dbeafe; padding:20px; border-radius:10px;">
                        <h3 style="color:#2563eb; margin:0 0 15px 0;">💻 مهارات الكمبيوتر</h3>
                        ${data.computer.map(c => `<div style="margin-bottom:8px;"><strong>${c.program}:</strong> ${c.level}</div>`).join('')}
                    </div>
                </div>

                <div style="background:#f3f4f6; padding:20px; border-radius:10px; margin-bottom:25px;">
                    <h3 style="color:#667eea; margin:0 0 15px 0;">📜 الدورات التدريبية</h3>
                    <div style="display:grid; gap:10px;">
                        ${data.courses.map(c => `<div style="background:white; padding:12px; border-radius:8px;"><strong>${c.name}</strong> - ${c.org}</div>`).join('')}
                    </div>
                </div>

                <div style="background:#f3f4f6; padding:20px; border-radius:10px; margin-bottom:25px;">
                    <h3 style="color:#667eea; margin:0 0 15px 0;">👥 المراجع</h3>
                    ${data.references.map(r => `
                        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:10px;">
                            <strong style="color:#1f2937;">${r.name}</strong>
                            <div style="color:#6b7280; margin-top:5px;">${r.phone} | ${r.email}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="background:#f9fafb; padding:25px; border-radius:10px; border:2px solid #667eea;">
                    <h3 style="color:#667eea; margin:0 0 15px 0;">✉️ خطاب التقديم</h3>
                    <div style="line-height:2; color:#4b5563;">${coverLetter.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        </div>`;
    },

    // القالب البسيط - متوافق مع ATS
    minimal: (data) => {
        const coverLetter = generateCoverLetter(data);

        return `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; color:#000; line-height: 1.6; max-width: 800px; margin: auto;">
            <div style="text-align:center; margin-bottom:30px;">
                <h1 style="margin:0 0 10px 0; font-size:2rem; font-weight:bold;">${data.personal.name}</h1>
                <p style="margin:5px 0;">${data.personal.address} | ${data.personal.phone} | ${data.personal.email}</p>
                <p style="margin:5px 0; font-size:0.9rem;">الجنسية: ${data.personal.nationality} | ${data.personal.dob} | ${data.personal.gender}</p>
            </div>

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">المؤهلات العلمية</h2>
            ${data.education.map(e => `
                <div style="margin-bottom:15px;">
                    <strong>${e.degree}</strong> - ${e.school}
                </div>
            `).join('')}

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">الخبرات العملية</h2>
            ${data.experience.map(e => `
                <div style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:5px;">
                        <span>${e.title}</span>
                        <span>${e.date}</span>
                    </div>
                    <div style="font-style:italic; margin-bottom:8px;">${e.org}</div>
                    <ul style="margin:0; padding-right:20px;">
                        ${e.tasks.map(t => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">المهارات</h2>
            <ul style="padding-right:20px; columns:2; column-gap:20px;">
                ${data.skills.map(s => `<li style="margin-bottom:6px;">${s}</li>`).join('')}
            </ul>

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">اللغات</h2>
            <p>العربية: ${data.languages.ar} | الإنجليزية: ${data.languages.en}</p>

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">مهارات الكمبيوتر</h2>
            <p>${data.computer.map(c => `${c.program} (${c.level})`).join(' | ')}</p>

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">الدورات التدريبية</h2>
            <ul style="padding-right:20px;">
                ${data.courses.map(c => `<li style="margin-bottom:6px;">${c.name} - ${c.org}</li>`).join('')}
            </ul>

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">المراجع</h2>
            ${data.references.map(r => `<p style="margin-bottom:10px;"><strong>${r.name}</strong> - ${r.phone} - ${r.email}</p>`).join('')}

            <h2 style="border-bottom:2px solid #000; padding-bottom:5px; margin:25px 0 15px 0; font-size:1.3rem;">خطاب التقديم</h2>
            <div style="line-height:2; text-align:justify;">${coverLetter.replace(/\n/g, '<br>')}</div>
        </div>`;
    },

    // القالب الإبداعي - للمجالات الإبداعية
    creative: (data) => {
        const coverLetter = generateCoverLetter(data);

        return `
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; color:#2d3748; line-height: 1.8; max-width: 800px; margin: auto; background:#f7fafc;">
            <div style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); padding:50px 30px; text-align:center; clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);">
                <h1 style="margin:0; color:white; font-size:3rem; font-weight:900; text-shadow:2px 2px 4px rgba(0,0,0,0.3);">${data.personal.name}</h1>
                <p style="margin:20px 0 0 0; color:white; font-size:1.2rem; opacity:0.95;">${data.personal.address}</p>
                <p style="margin:10px 0 0 0; color:white; opacity:0.9;">${data.personal.phone} | ${data.personal.email}</p>
            </div>

            <div style="padding:30px;">
                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-bottom:25px; border-right:8px solid #ff6b6b;">
                    <h3 style="color:#ff6b6b; margin:0 0 20px 0; font-size:1.5rem; display:flex; align-items:center; gap:10px;">
                        <span style="font-size:2rem;">🎓</span> المؤهلات العلمية
                    </h3>
                    ${data.education.map(e => `
                        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:15px; border-radius:10px; margin-bottom:12px;">
                            <strong style="font-size:1.1rem;">${e.degree}</strong>
                            <div style="margin-top:5px; opacity:0.9;">${e.school}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-bottom:25px; border-right:8px solid #4ecdc4;">
                    <h3 style="color:#4ecdc4; margin:0 0 20px 0; font-size:1.5rem; display:flex; align-items:center; gap:10px;">
                        <span style="font-size:2rem;">💼</span> الخبرات العملية
                    </h3>
                    ${data.experience.map((e, idx) => `
                        <div style="background:${idx % 2 === 0 ? '#fff5f5' : '#f0fff4'}; padding:20px; border-radius:12px; margin-bottom:15px; border:2px solid ${idx % 2 === 0 ? '#ff6b6b' : '#4ecdc4'};">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <h4 style="margin:0; color:${idx % 2 === 0 ? '#ff6b6b' : '#4ecdc4'}; font-size:1.2rem;">${e.title}</h4>
                                <span style="background:${idx % 2 === 0 ? '#ff6b6b' : '#4ecdc4'}; color:white; padding:6px 15px; border-radius:20px; font-size:0.85rem; font-weight:bold;">${e.date}</span>
                            </div>
                            <div style="color:#718096; font-weight:600; margin-bottom:12px; font-size:1.05rem;">${e.org}</div>
                            <ul style="margin:0; padding-right:20px; color:#4a5568;">
                                ${e.tasks.map(t => `<li style="margin-bottom:6px;">${t}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>

                <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding:30px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-bottom:25px;">
                    <h3 style="color:white; margin:0 0 20px 0; font-size:1.5rem; display:flex; align-items:center; gap:10px;">
                        <span style="font-size:2rem;">⭐</span> المهارات الشخصية
                    </h3>
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
                        ${data.skills.map(s => `
                            <div style="background:rgba(255,255,255,0.25); backdrop-filter:blur(10px); color:white; padding:12px; border-radius:10px; font-weight:600; text-align:center;">
                                ${s}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:25px;">
                    <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-top:5px solid #fbbf24;">
                        <h3 style="color:#fbbf24; margin:0 0 15px 0; font-size:1.2rem;">🌍 اللغات</h3>
                        <p style="margin:0; line-height:2;"><strong>العربية:</strong> ${data.languages.ar}<br><strong>الإنجليزية:</strong> ${data.languages.en}</p>
                    </div>
                    <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-top:5px solid #8b5cf6;">
                        <h3 style="color:#8b5cf6; margin:0 0 15px 0; font-size:1.2rem;">💻 الكمبيوتر</h3>
                        ${data.computer.map(c => `<div style="margin-bottom:8px;"><strong>${c.program}:</strong> ${c.level}</div>`).join('')}
                    </div>
                </div>

                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-bottom:25px; border-right:8px solid #10b981;">
                    <h3 style="color:#10b981; margin:0 0 15px 0; font-size:1.3rem;">📜 الدورات التدريبية</h3>
                    <div style="display:grid; gap:10px;">
                        ${data.courses.map(c => `<div style="background:#f0fdf4; padding:12px; border-radius:8px; border-right:3px solid #10b981;"><strong>${c.name}</strong> - ${c.org}</div>`).join('')}
                    </div>
                </div>

                <div style="background:white; padding:25px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1); margin-bottom:25px; border-right:8px solid #6366f1;">
                    <h3 style="color:#6366f1; margin:0 0 15px 0; font-size:1.3rem;">👥 المراجع</h3>
                    ${data.references.map(r => `
                        <div style="background:#eef2ff; padding:15px; border-radius:10px; margin-bottom:10px;">
                            <strong style="color:#4338ca; font-size:1.1rem;">${r.name}</strong>
                            <div style="color:#6b7280; margin-top:5px;">${r.phone} | ${r.email}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:30px; border-radius:15px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                    <h3 style="color:white; margin:0 0 20px 0; font-size:1.5rem;">✉️ خطاب التقديم</h3>
                    <div style="background:rgba(255,255,255,0.95); padding:20px; border-radius:10px; line-height:2; color:#2d3748;">
                        ${coverLetter.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        </div>`;
    }
};

// دالة توليد خطاب التقديم
function generateCoverLetter(data) {
    return `عزيزي الموارد البشرية،

يسعدني الرد على إعلانكم الذي قرأت عنه في مواقع عمل المنظمات، مؤهلاتي وخبراتي العملية تتناسب تمامًا مع ما تحتاجه المنظمة لهذا المنصب. لدي معرفة كافية بالمسؤوليات التي قمت بالإعلان عنها، وأنا على أتم الاستعداد للمساهمة في تحقيق أهداف فريق العمل بكفاءة عالية.

كما سترى في السيرة الذاتية المرفقة، العمل الذي قمت به خلال السنوات الماضية يعكس شغفي والتزامي المهني. خلال هذه الفترة، أقمت علاقات بروتوكولية ممتازة مع السلطات المحلية والشركاء، واكتسبت خبرة ميدانية كبيرة في القدرة على حل المشكلات المعقدة والعمل بمرونة في البيئات الصعبة والضاغطة. لدي القدرة الكاملة على قيادة أي عمل بنجاح وإنشاء فريق متعاون يضمن التواصل الفعال بين إدارة المشروعات والموظفين الميدانيين.

سأكون ممتناً جداً لمقابلتكم في وقت قريب لمعرفة المزيد عن قدراتي وكيف يمكنني أن أضع خبرتي في خدمة أهدافكم النبيلة. شكرًا لك على اهتمامك بطلبي والوقت الثمين الذي خصصته لقراءته.

مع خالص التقدير والامتنان،
${data.personal.name}`;
}

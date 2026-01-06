/**
 * Firebase Integration for Athar Platform
 * نظام التكامل مع Firebase Firestore
 * 
 * هذا الملف يوفر جميع الوظائف المطلوبة للتعامل مع قاعدة بيانات Firebase
 */

// ⚙️ إعدادات Firebase - استبدل هذه القيم بقيمك الخاصة من Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
let db = null;
let auth = null;

async function initFirebase() {
    try {
        // تحميل مكتبات Firebase من CDN
        if (!window.firebase) {
            await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js');
        }

        // تهيئة Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();
        auth = firebase.auth();

        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

// دالة مساعدة لتحميل السكريبتات
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ═══════════════════════════════════════════════════════════════
// 🔐 نظام المصادقة (Authentication)
// ═══════════════════════════════════════════════════════════════

/**
 * تسجيل مستخدم جديد
 */
async function signupUser(email, password, name) {
    try {
        if (!auth) await initFirebase();

        // إنشاء حساب جديد
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // حفظ بيانات المستخدم الإضافية في Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: email,
            name: name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            activationCodes: []
        });

        return {
            status: 'success',
            message: 'تم إنشاء الحساب بنجاح',
            user: {
                uid: user.uid,
                email: user.email,
                name: name
            }
        };
    } catch (error) {
        console.error('Signup error:', error);

        // رسائل خطأ مخصصة بالعربية
        let message = 'حدث خطأ أثناء التسجيل';
        if (error.code === 'auth/email-already-in-use') {
            message = 'هذا البريد الإلكتروني مسجل مسبقاً';
        } else if (error.code === 'auth/weak-password') {
            message = 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
        } else if (error.code === 'auth/invalid-email') {
            message = 'البريد الإلكتروني غير صالح';
        }

        return {
            status: 'error',
            message: message
        };
    }
}

/**
 * تسجيل الدخول
 */
async function loginUser(email, password) {
    try {
        if (!auth) await initFirebase();

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // تحديث آخر تسجيل دخول
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        // جلب بيانات المستخدم
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        return {
            status: 'success',
            user: {
                uid: user.uid,
                email: user.email,
                name: userData.name
            }
        };
    } catch (error) {
        console.error('Login error:', error);

        let message = 'حدث خطأ أثناء تسجيل الدخول';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (error.code === 'auth/invalid-email') {
            message = 'البريد الإلكتروني غير صالح';
        }

        return {
            status: 'error',
            message: message
        };
    }
}

/**
 * تسجيل الخروج
 */
async function logoutUser() {
    try {
        if (!auth) await initFirebase();
        await auth.signOut();
        return { status: 'success', message: 'تم تسجيل الخروج بنجاح' };
    } catch (error) {
        console.error('Logout error:', error);
        return { status: 'error', message: 'حدث خطأ أثناء تسجيل الخروج' };
    }
}

/**
 * الحصول على المستخدم الحالي
 */
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// ═══════════════════════════════════════════════════════════════
// 💎 نظام التحقق من الأكواد
// ═══════════════════════════════════════════════════════════════

/**
 * التحقق من كود التفعيل
 */
async function verifyActivationCode(code, id, page) {
    try {
        if (!db) await initFirebase();

        // التحقق من صحة الكود (ID + 2025)
        const expectedCode = parseInt(id) + 2025;
        if (parseInt(code) !== expectedCode) {
            return {
                status: 'error',
                message: 'كود التفعيل غير صحيح لهذه العملية'
            };
        }

        // التحقق من عدم استخدام الكود مسبقاً
        const usedCodesRef = db.collection('usedCodes');
        const querySnapshot = await usedCodesRef
            .where('code', '==', code)
            .where('id', '==', id)
            .get();

        if (!querySnapshot.empty) {
            return {
                status: 'error',
                message: 'هذه العملية تم تفعيلها مسبقاً'
            };
        }

        // الحصول على المستخدم الحالي (إن وجد)
        const currentUser = getCurrentUser();
        const userId = currentUser ? currentUser.uid : 'anonymous';

        // تسجيل الكود كمستخدم
        const codeData = {
            code: code,
            id: id,
            userId: userId,
            page: page || 'unknown',
            usedAt: firebase.firestore.FieldValue.serverTimestamp(),
            ipAddress: await getUserIP() // اختياري
        };

        await usedCodesRef.add(codeData);

        // إذا كان المستخدم مسجلاً، أضف الكود إلى سجله
        if (currentUser) {
            await db.collection('users').doc(userId).update({
                activationCodes: firebase.firestore.FieldValue.arrayUnion({
                    code: code,
                    id: id,
                    page: page,
                    usedAt: new Date().toISOString()
                })
            });
        }

        return {
            status: 'success',
            message: 'تم التفعيل بنجاح'
        };
    } catch (error) {
        console.error('Verification error:', error);
        return {
            status: 'error',
            message: 'حدث خطأ أثناء التحقق من الكود'
        };
    }
}

/**
 * الحصول على عنوان IP المستخدم (اختياري)
 */
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// ═══════════════════════════════════════════════════════════════
// 📊 نظام الإحصائيات
// ═══════════════════════════════════════════════════════════════

/**
 * تسجيل زيارة جديدة
 */
async function recordVisitor() {
    try {
        if (!db) await initFirebase();

        const statsRef = db.collection('stats').doc('visitors');

        // استخدام Transaction لضمان الدقة
        await db.runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(statsRef);

            const today = new Date().toISOString().split('T')[0];

            if (!statsDoc.exists) {
                // إنشاء وثيقة جديدة
                transaction.set(statsRef, {
                    visitorCount: 1528, // رقم تأسيسي
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    dailyVisits: {
                        [today]: 1
                    }
                });
            } else {
                // تحديث العداد
                const currentData = statsDoc.data();
                const newCount = (currentData.visitorCount || 1527) + 1;
                const dailyVisits = currentData.dailyVisits || {};
                dailyVisits[today] = (dailyVisits[today] || 0) + 1;

                transaction.update(statsRef, {
                    visitorCount: newCount,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                    dailyVisits: dailyVisits
                });
            }
        });

        // جلب العدد المحدث
        const updatedDoc = await statsRef.get();
        const count = updatedDoc.data().visitorCount;

        return {
            status: 'success',
            count: count
        };
    } catch (error) {
        console.error('Visitor recording error:', error);
        return {
            status: 'error',
            count: 1527
        };
    }
}

/**
 * الحصول على إحصائيات الموقع
 */
async function getStats() {
    try {
        if (!db) await initFirebase();

        const statsDoc = await db.collection('stats').doc('visitors').get();

        if (statsDoc.exists) {
            return {
                status: 'success',
                data: statsDoc.data()
            };
        } else {
            return {
                status: 'success',
                data: {
                    visitorCount: 1527,
                    dailyVisits: {}
                }
            };
        }
    } catch (error) {
        console.error('Stats retrieval error:', error);
        return {
            status: 'error',
            data: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 📚 نظام المكتبة والوظائف
// ═══════════════════════════════════════════════════════════════

/**
 * جلب الوظائف
 */
async function getJobs(limit = 50) {
    try {
        if (!db) await initFirebase();

        const jobsSnapshot = await db.collection('jobs')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const jobs = [];
        jobsSnapshot.forEach(doc => {
            jobs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            status: 'success',
            data: jobs
        };
    } catch (error) {
        console.error('Jobs retrieval error:', error);
        return {
            status: 'error',
            data: []
        };
    }
}

/**
 * جلب موارد المكتبة
 */
async function getLibraryResources(limit = 50) {
    try {
        if (!db) await initFirebase();

        const librarySnapshot = await db.collection('library')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const resources = [];
        librarySnapshot.forEach(doc => {
            resources.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            status: 'success',
            data: resources
        };
    } catch (error) {
        console.error('Library retrieval error:', error);
        return {
            status: 'error',
            data: []
        };
    }
}

/**
 * إضافة وظيفة جديدة
 */
async function addJob(jobData) {
    try {
        if (!db) await initFirebase();

        const docRef = await db.collection('jobs').add({
            ...jobData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return {
            status: 'success',
            id: docRef.id,
            message: 'تم إضافة الوظيفة بنجاح'
        };
    } catch (error) {
        console.error('Job addition error:', error);
        return {
            status: 'error',
            message: 'حدث خطأ أثناء إضافة الوظيفة'
        };
    }
}

/**
 * إضافة مورد للمكتبة
 */
async function addLibraryResource(resourceData) {
    try {
        if (!db) await initFirebase();

        const docRef = await db.collection('library').add({
            ...resourceData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return {
            status: 'success',
            id: docRef.id,
            message: 'تم إضافة المورد بنجاح'
        };
    } catch (error) {
        console.error('Resource addition error:', error);
        return {
            status: 'error',
            message: 'حدث خطأ أثناء إضافة المورد'
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// 🔄 التوافق مع النظام الحالي
// ═══════════════════════════════════════════════════════════════

/**
 * دالة موحدة للتعامل مع الطلبات (متوافقة مع bridge_script.js)
 */
async function handleFirebaseRequest(action, params) {
    switch (action) {
        case 'test':
            return { status: 'success', message: 'Connected to Firebase Successfully' };

        case 'visitor':
            return await recordVisitor();

        case 'verifyCode':
            return await verifyActivationCode(params.code, params.id, params.page);

        case 'signup':
            return await signupUser(params.email, params.password, params.name);

        case 'login':
            return await loginUser(params.email, params.password);

        case 'getJobs':
            return await getJobs(params.limit);

        case 'getLibrary':
            return await getLibraryResources(params.limit);

        default:
            return { status: 'error', message: 'Unknown action' };
    }
}

// ═══════════════════════════════════════════════════════════════
// 🚀 تهيئة تلقائية عند تحميل الصفحة
// ═══════════════════════════════════════════════════════════════

// تهيئة Firebase تلقائياً عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

// تصدير الدوال للاستخدام العام
window.FirebaseDB = {
    init: initFirebase,
    auth: {
        signup: signupUser,
        login: loginUser,
        logout: logoutUser,
        getCurrentUser: getCurrentUser
    },
    codes: {
        verify: verifyActivationCode
    },
    stats: {
        recordVisitor: recordVisitor,
        getStats: getStats
    },
    content: {
        getJobs: getJobs,
        getLibrary: getLibraryResources,
        addJob: addJob,
        addResource: addLibraryResource
    },
    handleRequest: handleFirebaseRequest
};

console.log('🔥 Firebase integration module loaded');

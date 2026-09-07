// form-handler.js - معالج النموذج وإرسال البيانات

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
    
    try {
        const formData = collectFormData(form);
        const validationResult = validateFormData(formData);
        if (!validationResult.valid) {
            throw new Error(validationResult.message);
        }
        
        // محاولة إرسال البريد عبر FormSubmit
        const emailSent = await sendViaFormSubmit(formData);
        
        if (emailSent) {
            console.log('✅ تم إرسال البريد بنجاح');
        } else {
            console.warn('⚠️ فشل إرسال البريد، ولكن تم حفظ البيانات محلياً');
        }
        
        // حفظ البيانات في LocalStorage
        saveToLocalStorage(formData);
        
        // عرض رسالة النجاح
        showSuccessMessage(formData);
        updateRegistrationCount();
        
        setTimeout(() => {
            form.reset();
        }, 500);
        
    } catch (error) {
        console.error('خطأ:', error);
        showErrorMessage(error.message || 'حدث خطأ أثناء الإرسال');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function collectFormData(form) {
    return {
        full_name_ar: form.querySelector('#full_name_ar')?.value.trim() || '',
        full_name_en: form.querySelector('#full_name_en')?.value.trim() || '',
        national_id: form.querySelector('#national_id')?.value.trim() || '',
        nationality: form.querySelector('#nationality')?.value || '',
        email: form.querySelector('#email')?.value.trim() || '',
        phone: form.querySelector('#phone')?.value.trim() || '',
        academic_level: form.querySelector('#academic_level')?.value || '',
        university: form.querySelector('#university')?.value.trim() || '',
        department: form.querySelector('#department')?.value.trim() || '',
        year_of_study: form.querySelector('#year_of_study')?.value.trim() || '',
        timestamp: new Date().toISOString(),
        registration_id: 'SS2026-' + Date.now()
    };
}

function validateFormData(data) {
    const requiredFields = [
        { field: 'full_name_ar', name: 'الاسم الكامل (عربي)' },
        { field: 'full_name_en', name: 'الاسم الكامل (إنجليزي)' },
        { field: 'national_id', name: 'الرقم القومي' },
        { field: 'nationality', name: 'الجنسية' },
        { field: 'email', name: 'البريد الإلكتروني' },
        { field: 'phone', name: 'رقم الهاتف' },
        { field: 'academic_level', name: 'المستوى الدراسي' },
        { field: 'university', name: 'الجامعة' },
        { field: 'department', name: 'القسم' }
    ];
    
    for (const req of requiredFields) {
        if (!data[req.field] || data[req.field].trim() === '') {
            return { valid: false, message: `حقل ${req.name} مطلوب` };
        }
    }
    
    const idPattern = /^[0-9]{14}$/;
    if (!idPattern.test(data.national_id)) {
        return { valid: false, message: 'الرقم القومي يجب أن يكون 14 رقماً' };
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        return { valid: false, message: 'البريد الإلكتروني غير صالح' };
    }
    
    const phonePattern = /^01[0-9]{9}$/;
    if (!phonePattern.test(data.phone)) {
        return { valid: false, message: 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 01' };
    }
    
    return { valid: true };
}

// ============================================
// إرسال البريد عبر FormSubmit.co
// ============================================
async function sendViaFormSubmit(data) {
    try {
        // إرسال إلى المنظم (physiawy@gmail.com)
        const adminResponse = await fetch('https://formsubmit.co/ajax/physiawy@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `🔴 تسجيل جديد - Summer School 2026 - ${data.full_name_en}`,
                _replyto: data.email,
                _template: 'table',
                _cc: data.email,
                _captcha: 'false',
                
                // بيانات التسجيل
                '🆔 رقم التسجيل': data.registration_id,
                '📅 تاريخ التسجيل': new Date(data.timestamp).toLocaleString('ar-EG'),
                
                '👤 الاسم (عربي)': data.full_name_ar,
                '👤 الاسم (إنجليزي)': data.full_name_en,
                '🪪 الرقم القومي': data.national_id,
                '🌍 الجنسية': data.nationality,
                '📧 البريد الإلكتروني': data.email,
                '📱 رقم الهاتف': data.phone,
                '🎓 المستوى الدراسي': data.academic_level,
                '🏫 الجامعة': data.university,
                '📚 القسم': data.department,
                '📖 السنة الدراسية': data.year_of_study || 'غير محدد'
            })
        });
        
        if (!adminResponse.ok) {
            console.warn('فشل إرسال البريد للمنظم:', adminResponse.status);
            return false;
        }
        
        const adminResult = await adminResponse.json();
        console.log('✅ تم إرسال البريد للمنظم:', adminResult);
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في إرسال البريد:', error);
        return false;
    }
}

// ============================================
// حفظ البيانات في LocalStorage
// ============================================
function saveToLocalStorage(data) {
    try {
        const submissions = JSON.parse(localStorage.getItem('summer_school_submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('summer_school_submissions', JSON.stringify(submissions));
        console.log('✅ تم حفظ البيانات محلياً. إجمالي المسجلين:', submissions.length);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ البيانات محلياً:', error);
        return false;
    }
}

// ============================================
// عرض رسالة النجاح
// ============================================
function showSuccessMessage(data) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const modal = document.getElementById('successModal');
    const modalContent = document.getElementById('modalContent');
    
    if (userName) userName.textContent = data.full_name_en;
    if (userEmail) userEmail.textContent = data.email;
    
    if (modal && modalContent) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
}

// ============================================
// عرض رسالة الخطأ
// ============================================
function showErrorMessage(message) {
    alert(`❌ خطأ: ${message}`);
}

// ============================================
// تحديث عدد المسجلين
// ============================================
function updateRegistrationCount() {
    const countElement = document.getElementById('registeredCount');
    if (!countElement) return;
    const submissions = JSON.parse(localStorage.getItem('summer_school_submissions') || '[]');
    countElement.textContent = submissions.length;
}

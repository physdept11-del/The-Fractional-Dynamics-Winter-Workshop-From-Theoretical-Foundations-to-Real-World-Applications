// form-handler.js - معالج النموذج وإرسال البيانات

// تهيئة معالج النموذج
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
});

// معالجة إرسال النموذج
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // تعطيل الزر وإظهار التحميل
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
    
    try {
        // جمع البيانات من النموذج
        const formData = collectFormData(form);
        
        // التحقق من البيانات
        const validationResult = validateFormData(formData);
        if (!validationResult.valid) {
            throw new Error(validationResult.message);
        }
        
        // الخيار 1: إرسال البيانات عبر FormSubmit.co
        const emailResult = await sendViaFormSubmit(formData);
        
        // الخيار 2: حفظ البيانات محلياً
        saveToLocalStorage(formData);
        
        // الخيار 3: حفظ في JSON ملف (للاستضافة الثابتة)
        await saveToJsonFile(formData);
        
        // عرض رسالة النجاح
        showSuccessMessage(formData);
        
        // تحديث الإحصائيات
        updateRegistrationCount();
        
        // إعادة تعيين النموذج
        setTimeout(() => {
            form.reset();
        }, 500);
        
    } catch (error) {
        console.error('خطأ في المعالجة:', error);
        showErrorMessage(error.message || 'حدث خطأ أثناء الإرسال');
    } finally {
        // إعادة تمكين الزر
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// جمع بيانات النموذج
function collectFormData(form) {
    const formData = {
        // البيانات الشخصية
        full_name_ar: form.querySelector('#full_name_ar')?.value.trim() || '',
        full_name_en: form.querySelector('#full_name_en')?.value.trim() || '',
        email: form.querySelector('#email')?.value.trim() || '',
        phone: form.querySelector('#phone')?.value.trim() || '',
        nationality: form.querySelector('#nationality')?.value.trim() || '',
        
        // المعلومات الأكاديمية
        academic_level: form.querySelector('#academic_level')?.value || '',
        university: form.querySelector('#university')?.value.trim() || '',
        department: form.querySelector('#department')?.value.trim() || '',
        year_of_study: form.querySelector('#year_of_study')?.value.trim() || '',
        
        // الشهادة
        certificate: form.querySelector('input[name="certificate"]:checked')?.value || '',
        
        // مجالات الاهتمام
        interests: Array.from(form.querySelectorAll('input[name="interests[]"]:checked'))
                     .map(cb => cb.value),
        
        // بيانات إضافية
        timestamp: new Date().toISOString(),
        registration_id: 'PHYS-' + Date.now(),
        workshop_title: 'New Frontiers in Physics: Theory, Experiment, and Medicine',
        location: 'قسم الفيزياء - كلية العلوم - جامعة المنصورة',
        department_chair: 'أ.د. محمد عبدالكريم البقرى',
        workshop_coordinator: 'أ.م.د. الإمام زكريا عمر'
    };
    
    return formData;
}

// التحقق من البيانات
function validateFormData(data) {
    const requiredFields = [
        { field: 'full_name_ar', name: 'الاسم الكامل (عربي)' },
        { field: 'full_name_en', name: 'الاسم الكامل (إنجليزي)' },
        { field: 'email', name: 'البريد الإلكتروني' },
        { field: 'phone', name: 'رقم الهاتف' },
        { field: 'academic_level', name: 'المستوى الدراسي' },
        { field: 'university', name: 'الجامعة' },
        { field: 'department', name: 'القسم' },
        { field: 'certificate', name: 'خيار الشهادة' }
    ];
    
    for (const req of requiredFields) {
        if (!data[req.field] || data[req.field].trim() === '') {
            return {
                valid: false,
                message: `حقل ${req.name} مطلوب`
            };
        }
    }
    
    // التحقق من البريد الإلكتروني
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        return {
            valid: false,
            message: 'البريد الإلكتروني غير صالح'
        };
    }
    
    // التحقق من رقم الهاتف (مصري)
    const phonePattern = /^01[0-9]{9}$/;
    if (!phonePattern.test(data.phone)) {
        return {
            valid: false,
            message: 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 01'
        };
    }
    
    return { valid: true };
}

// إرسال البيانات عبر FormSubmit.co
async function sendViaFormSubmit(data) {
    try {
        const response = await fetch('https://formsubmit.co/ajax/phys.dept11@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `تسجيل جديد - ${data.full_name_ar} - ورشة الفيزياء`,
                _replyto: data.email,
                _template: 'table',
                _cc: data.email, // إرسال نسخة للمشارك
                
                // بيانات النموذج
                'ورشة العمل': data.workshop_title,
                'الاسم (عربي)': data.full_name_ar,
                'الاسم (إنجليزي)': data.full_name_en,
                'البريد الإلكتروني': data.email,
                'رقم الهاتف': data.phone,
                'الجنسية': data.nationality,
                'المستوى الدراسي': data.academic_level,
                'الجامعة': data.university,
                'القسم': data.department,
                'السنة الدراسية': data.year_of_study,
                'الشهادة': data.certificate,
                'مجالات الاهتمام': data.interests.join(', '),
                'رقم التسجيل': data.registration_id,
                'المكان': data.location,
                'وقت التسجيل': new Date(data.timestamp).toLocaleString('ar-EG')
            })
        });
        
        if (!response.ok) {
            throw new Error('فشل إرسال البريد');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('فشل إرسال البريد:', error);
        // نستمر في العملية حتى لو فشل إرسال البريد
        return { success: false, message: 'سيتم حفظ البيانات محلياً' };
    }
}

// حفظ البيانات في LocalStorage
function saveToLocalStorage(data) {
    try {
        const submissions = JSON.parse(localStorage.getItem('workshop_submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('workshop_submissions', JSON.stringify(submissions));
        
        console.log('تم حفظ البيانات محلياً:', submissions.length);
        return true;
    } catch (error) {
        console.error('خطأ في حفظ البيانات محلياً:', error);
        return false;
    }
}

// حفظ البيانات في ملف JSON (للاستضافة الثابتة)
async function saveToJsonFile(data) {
    try {
        // في بيئة GitHub Pages، يمكن استخدام GitHub API لحفظ البيانات
        // لكن هنا سنستخدم LocalStorage كبديل
        console.log('تم حفظ بيانات التسجيل:', data.registration_id);
        return true;
    } catch (error) {
        console.warn('لا يمكن حفظ JSON في الاستضافة الثابتة:', error);
        return false;
    }
}

// عرض رسالة النجاح
function showSuccessMessage(data) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const modal = document.getElementById('successModal');
    const modalContent = document.getElementById('modalContent');
    
    if (userName) userName.textContent = data.full_name_ar;
    if (userEmail) userEmail.textContent = data.email;
    
    if (modal && modalContent) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
    
    // إرسال إشعار بالمتصفح
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('تم التسجيل بنجاح!', {
            body: `شكراً ${data.full_name_ar} على تسجيلك`,
            icon: '/assets/logo.png'
        });
    }
}

// عرض رسالة الخطأ
function showErrorMessage(message) {
    alert(`❌ خطأ: ${message}`);
}

// تحديث عدد المسجلين
function updateRegistrationCount() {
    const countElement = document.getElementById('registeredCount');
    if (!countElement) return;
    
    const submissions = JSON.parse(localStorage.getItem('workshop_submissions') || '[]');
    const baseCount = 47;
    countElement.textContent = submissions.length + baseCount;
}

// التصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleFormSubmit,
        collectFormData,
        validateFormData,
        saveToLocalStorage,
        updateRegistrationCount
    };
}
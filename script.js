// script.js - الملف الرئيسي للجافاسكريبت

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحديث عدد المسجلين
    updateRegistrationCount();
    
    // إضافة تأثيرات على الحقول
    addInputEffects();
    
    // إعداد تحقق من البريد الإلكتروني
    setupEmailValidation();
    
    // إعداد تحقق من رقم الهاتف
    setupPhoneValidation();
});

// تحديث عدد المسجلين
function updateRegistrationCount() {
    const countElement = document.getElementById('registeredCount');
    if (!countElement) return;
    
    // جلب البيانات المحفوظة
    const submissions = JSON.parse(localStorage.getItem('workshop_submissions') || '[]');
    const baseCount = 250; // عدد افتراضي
    countElement.textContent = submissions.length + baseCount;
}

// إضافة تأثيرات على الحقول
function addInputEffects() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // تأثير عند التركيز
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('ring-2', 'ring-blue-200');
        });
        
        // تأثير عند فقدان التركيز
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('ring-2', 'ring-blue-200');
        });
    });
}

// تحقق من البريد الإلكتروني
function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (!email) return;
        
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showInputError(this, 'البريد الإلكتروني غير صالح');
        } else {
            clearInputError(this);
        }
    });
}

// تحقق من رقم الهاتف
function setupPhoneValidation() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('blur', function() {
        const phone = this.value.trim();
        if (!phone) return;
        
        const phonePattern = /^01[0-9]{9}$/;
        if (!phonePattern.test(phone)) {
            showInputError(this, 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 01');
        } else {
            clearInputError(this);
        }
    });
    
    // منع إدخال حروف في حقل الهاتف
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// عرض خطأ للحقل
function showInputError(input, message) {
    clearInputError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
    input.classList.add('border-red-500');
}

// إزالة خطأ الحقل
function clearInputError(input) {
    const errorDiv = input.parentElement.querySelector('.text-red-500');
    if (errorDiv) {
        errorDiv.remove();
    }
    input.classList.remove('border-red-500');
}

// إغلاق نافذة النجاح
function closeModal() {
    const modal = document.getElementById('successModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// توليد معرف فريد للتسجيل
function generateRegistrationId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PHYS-${timestamp}-${random}`;
}

// تهيئة تحميل الصفحة مع بيانات عشوائية (للتجربة)
window.initializeDemoData = function() {
    const demoCount = 47;
    const countElement = document.getElementById('registeredCount');
    if (countElement && countElement.textContent === '0') {
        countElement.textContent = demoCount;
    }
};

// تشغيل بيانات التجربة عند تحميل الصفحة
if (typeof window !== 'undefined') {
    window.onload = initializeDemoData;
}

// تصدير الدوال للاستخدام الخارجي
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateRegistrationCount,
        closeModal,
        generateRegistrationId,
        showInputError,
        clearInputError
    };
}

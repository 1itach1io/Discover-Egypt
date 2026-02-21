
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}
function showMessage(message, type = 'info', duration = 4000) {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.setAttribute('role', 'alert');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    messageEl.innerHTML = `
        <i class="fas ${icons[type] || icons.info} message-icon"></i>
        <span>${message}</span>
        <button class="message-close" onclick="this.parentElement.remove()" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(messageEl);
    
    
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
    }, 10);
    
    
    if (duration > 0) {
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateY(-20px)';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
}
function showSuccess(message, duration) {
    showMessage(message, 'success', duration);
}
function showError(message, duration) {
    showMessage(message, 'error', duration);
}
function showWarning(message, duration) {
    showMessage(message, 'warning', duration);
}
function showInfo(message, duration) {
    showMessage(message, 'info', duration);
}




function validateNumberInput(input, min, max) {
    const value = parseInt(input.value);
    const errorElement = document.getElementById(input.id + '-error');
    
    if (isNaN(value) || value < min || value > max) {
        input.classList.add('invalid');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = `يجب إدخال رقم بين ${min} و ${max}`;
        }
        return false;
    } else {
        input.classList.remove('invalid');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
function validateRequired(input) {
    if (!input.value.trim()) {
        input.classList.add('invalid');
        return false;
    }
    input.classList.remove('invalid');
    return true;
}




function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getCurrentLanguage() {
    return document.documentElement.getAttribute('lang') || 'en';
}
function getTranslation(key) {
    const lang = getCurrentLanguage();
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key; 
        }
    }
    
    return value;
}
function smoothScrollTo(selector, offset = 80) {
    const element = document.querySelector(selector);
    if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess(getTranslation('common.copied') || 'Copied to clipboard!');
        return true;
    } catch (err) {
        showError(getTranslation('common.copyError') || 'Failed to copy');
        return false;
    }
}
function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
function formatDate(date, locale = 'en-US') {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}
function isMobile() {
    return window.innerWidth <= 768;
}
function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}
function getDeviceType() {
    if (isMobile()) return 'mobile';
    if (isTablet()) return 'tablet';
    return 'desktop';
}




function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}
function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Error removing from localStorage:', e);
    }
}




function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}
function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = initialOpacity * (1 - Math.min(progress / duration, 1));
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading,
        hideLoading,
        showMessage,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        validateNumberInput,
        validateEmail,
        validateRequired,
        debounce,
        throttle,
        formatNumber,
        getCurrentLanguage,
        getTranslation,
        smoothScrollTo,
        isInViewport,
        copyToClipboard,
        generateId,
        formatDate,
        isMobile,
        isTablet,
        getDeviceType,
        saveToStorage,
        loadFromStorage,
        removeFromStorage,
        fadeIn,
        fadeOut
    };
}

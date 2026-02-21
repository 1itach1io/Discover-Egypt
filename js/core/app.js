


let currentLanguage = 'en';

function getNestedTranslation(obj, key) {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
}

function applyTranslations() {
    const langData = translations[currentLanguage];
    if (!langData) return;

    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getNestedTranslation(langData, key);
        if (translation) element.textContent = translation;
    });

    const chatInput = document.getElementById('chat-input');
    if (chatInput && langData.ai?.placeholder) {
        chatInput.placeholder = langData.ai.placeholder;
    }

    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const translation = getNestedTranslation(langData, key);
        if (translation) element.placeholder = translation;
    });
}



document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeTheme();
    initializeLanguage();
    initializeMobileMenu();
    initializeFilters();
    initializeMap();
    initializeTools();
});

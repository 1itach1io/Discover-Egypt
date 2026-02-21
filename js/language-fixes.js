document.addEventListener('languageChange', function(e) {
    const newLang = e.detail.lang;
    if (window.EgyptTravelCalculator && typeof window.EgyptTravelCalculator.setLanguage === 'function') {
        window.EgyptTravelCalculator.setLanguage(newLang);
    }
    updateSearchPlaceholder(newLang);
    if (window.i18n && typeof window.i18n.setLanguage === 'function') {
        window.i18n.setLanguage(newLang);
    }
});


function updateSearchPlaceholder(lang) {
    const searchInput = document.getElementById('search-input');
    if (searchInput && window.translations && window.translations[lang]) {
        const placeholder = window.translations[lang].search?.placeholder || 'Search for places, cities...';
        searchInput.placeholder = placeholder;
        searchInput.setAttribute('data-translate-placeholder', 'search.placeholder');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = localStorage.getItem('language') || 'en';
    updateSearchPlaceholder(currentLang);
});

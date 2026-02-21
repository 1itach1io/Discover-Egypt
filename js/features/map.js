const mapUrls = {
    en: 'https://maps.app.goo.gl/ZoZbhHz61my5TJEe8',
    ar: 'https://maps.app.goo.gl/jJs37kMzLsS2g59MA',
    fr: 'https://maps.app.goo.gl/88tD641e7y3k6BcR8'
};
function initializeMap() {
    const openMapBtn = document.getElementById('openMapBtn');
    if (openMapBtn) {
        openMapBtn.addEventListener('click', function() {
            const currentLang = localStorage.getItem('language') || 'en';
            const mapUrl = mapUrls[currentLang] || mapUrls['en'];
            window.open(mapUrl, '_blank');
        });
    }
    document.addEventListener('languageChange', function(event) {
        updateMapButton(event.detail.lang);
    });
}
function updateMapButton(lang) {
    const openMapBtn = document.getElementById('openMapBtn');
    if (openMapBtn) {
        const currentLang = lang || localStorage.getItem('language') || 'en';
    }
}
window.updateMapButton = updateMapButton;
/*
 * features.bundle.js
 * Purpose: Reduce script tags by bundling UI features that don't require strict external load order.
 * Includes:
 *  - js/features/filters.js
 *  - js/features/map.js
 *  - js/explore-dynamic.js
 *  - js/search-advanced.js
 *  - js/user-menu-enhanced.js (cleaned)
 */

/* ===== js/features/filters.js ===== */

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterExploreCards(category);
        });
    });
}

function filterExploreCards(category) {
    const exploreCards = document.querySelectorAll('.explore-card');

    exploreCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.classList.remove('hidden');

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
                card.classList.add('hidden');
            }, 300);
        }
    });
}

document.addEventListener('cardsLoaded', () => {
    initializeFilters();
});

/* ===== js/features/map.js ===== */

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

    // Backward compatibility with older event name
    document.addEventListener('languageChange', function(event) {
        updateMapButton(event.detail?.lang);
    });

    // Current language event (from app.bundle.js)
    window.addEventListener('languagechange', function() {
        updateMapButton(document.documentElement.lang);
    });
}

function updateMapButton(_lang) {
    // Button currently has static label in HTML, but we keep this hook.
    const openMapBtn = document.getElementById('openMapBtn');
    if (!openMapBtn) return;
}

window.updateMapButton = updateMapButton;

/* ===== js/explore-dynamic.js ===== */

function getPlaceImage(placeId, category) {
    if (typeof placeImages !== 'undefined' && placeImages[placeId]) {
        return placeImages[placeId];
    }

    const fallbackImages = {
        ancient: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80',
        nature: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800&q=80',
        beach: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
        museum: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        religious: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
        historical: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
        modern: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=800&q=80',
        cultural: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    };

    return fallbackImages[category] || fallbackImages.ancient;
}

const governorateTranslations = {
    en: {
        Giza: 'Giza',
        Cairo: 'Cairo',
        Luxor: 'Luxor',
        Aswan: 'Aswan',
        Alexandria: 'Alexandria',
        'Red Sea': 'Red Sea',
        'South Sinai': 'South Sinai',
        Matrouh: 'Matrouh',
        'New Valley': 'New Valley',
        Fayoum: 'Fayoum',
        Qena: 'Qena',
        Sohag: 'Sohag',
        Beheira: 'Beheira'
    },
    ar: {
        Giza: 'الجيزة',
        Cairo: 'القاهرة',
        Luxor: 'الأقصر',
        Aswan: 'أسوان',
        Alexandria: 'الإسكندرية',
        'Red Sea': 'البحر الأحمر',
        'South Sinai': 'جنوب سيناء',
        Matrouh: 'مطروح',
        'New Valley': 'الوادي الجديد',
        Fayoum: 'الفيوم',
        Qena: 'قنا',
        Sohag: 'سوهاج',
        Beheira: 'البحيرة'
    },
    fr: {
        Giza: 'Gizeh',
        Cairo: 'Le Caire',
        Luxor: 'Louxor',
        Aswan: 'Assouan',
        Alexandria: 'Alexandrie',
        'Red Sea': 'Mer Rouge',
        'South Sinai': 'Sinaï du Sud',
        Matrouh: 'Matrouh',
        'New Valley': 'Nouvelle Vallée',
        Fayoum: 'Fayoum',
        Qena: 'Qena',
        Sohag: 'Sohag',
        Beheira: 'Beheira'
    }
};

const uiTranslations = {
    en: {
        viewOnMap: 'View on Map',
        showDetails: 'Show Details',
        addToFavorites: 'Add to Favorites'
    },
    ar: {
        viewOnMap: 'عرض على الخريطة',
        showDetails: 'عرض التفاصيل',
        addToFavorites: 'إضافة للمفضلة'
    },
    fr: {
        viewOnMap: 'Voir sur la carte',
        showDetails: 'Afficher les détails',
        addToFavorites: 'Ajouter aux favoris'
    }
};

function initializeExploreCards() {
    const cardsContainer = document.getElementById('explore-cards-container');
    if (!cardsContainer) {
        console.error('Cards container not found: missing <div id="explore-cards-container"> in HTML.');
        return;
    }

    const currentLang = window.currentLanguage || localStorage.getItem('language') || 'en';
    const allPlaces = placesData.places || [];

    cardsContainer.innerHTML = '';

    allPlaces.forEach(place => {
        const card = createExploreCard(place, currentLang);
        cardsContainer.appendChild(card);
    });

    document.dispatchEvent(new CustomEvent('cardsLoaded'));

    if (typeof initializeFilters === 'function') {
        initializeFilters();
    }
}

document.addEventListener('languageChange', function() {
    initializeExploreCards();
});
window.addEventListener('languagechange', function() {
    initializeExploreCards();
});

function createExploreCard(place, currentLang) {
    const card = document.createElement('div');
    card.className = 'explore-card';
    card.setAttribute('data-category', place.category);

    let placeName = place.name;
    let placeDesc = place.description;

    if (currentLang === 'ar') {
        placeName = place.nameAr || place.name;
        placeDesc = place.descriptionAr || place.description;
    } else if (currentLang === 'fr') {
        placeName = place.nameFr || place.name;
        placeDesc = place.descriptionFr || place.description;
    }

    const categoryIcons = {
        ancient: '🏛️',
        nature: '🌿',
        beach: '🏖️',
        museum: '🏛️',
        religious: '🕌',
        historical: '📜',
        modern: '🏙️',
        cultural: '🎭'
    };

    const categoryIcon = categoryIcons[place.category] || '📍';
    const placeImageUrl = getPlaceImage(place.id, place.category);

    const categoryNames = {
        en: {
            ancient: 'Ancient Sites',
            nature: 'Nature',
            beach: 'Beach',
            museum: 'Museum',
            religious: 'Religious',
            historical: 'Historical',
            modern: 'Modern',
            cultural: 'Cultural'
        },
        ar: {
            ancient: 'المواقع الأثرية',
            nature: 'الطبيعة',
            beach: 'شواطئ',
            museum: 'متحف',
            religious: 'ديني',
            historical: 'تاريخي',
            modern: 'حديث',
            cultural: 'ثقافي'
        },
        fr: {
            ancient: 'Sites Antiques',
            nature: 'Nature',
            beach: 'Plage',
            museum: 'Musée',
            religious: 'Religieux',
            historical: 'Historique',
            modern: 'Moderne',
            cultural: 'Culturel'
        }
    };

    const categoryName = categoryNames[currentLang]?.[place.category] || place.category;
    const governorateName = governorateTranslations[currentLang]?.[place.governorate] || place.governorate;

    card.innerHTML = `
        <div class="explore-card-image-container">
            <img src="${placeImageUrl}" alt="${placeName}" class="explore-card-image" loading="lazy">
            <div class="explore-card-category-badge">${categoryIcon} ${categoryName}</div>
        </div>
        <div class="explore-card-content">
            <h3 class="explore-card-title">${placeName}</h3>
            <div class="explore-card-meta">
                <span class="explore-card-location">📍 ${governorateName}</span>
                ${place.rating ? `
                    <div class="explore-card-rating">
                        <span class="rating-stars">${'⭐'.repeat(Math.round(place.rating))}</span>
                        <span class="rating-number">${place.rating}</span>
                    </div>
                ` : ''}
            </div>
            <p class="explore-card-description">${placeDesc}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        if (typeof map !== 'undefined' && place.coordinates) {
            const mapSection = document.getElementById('map');
            if (mapSection) {
                document.querySelectorAll('.section').forEach(sec => {
                    sec.classList.remove('active');
                });

                mapSection.classList.add('active');

                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === 'map') {
                        link.classList.add('active');
                    }
                });

                map.setView([place.coordinates.lat, place.coordinates.lng], 13);

                if (typeof L !== 'undefined') {
                    L.marker([place.coordinates.lat, place.coordinates.lng])
                        .addTo(map)
                        .bindPopup(`<b>${placeName}</b><br>${placeDesc}`)
                        .openPopup();
                }
            }
        }
    });

    return card;
}

function updateExploreCardsLanguage() {
    initializeExploreCards();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeExploreCards();
    }, 100);
});

/* ===== js/search-advanced.js ===== */

'use strict';

const searchTranslations = {
    en: {
        searchPlaceholder: 'Search destinations, restaurants, activities...',
        searching: 'Searching...',
        noResults: 'No results found',
        tryDifferent: 'Try different keywords or check spelling',
        resultsFound: 'results found',
        categories: {
            all: 'All Results',
            restaurants: 'Restaurants',
            attractions: 'Attractions',
            activities: 'Activities',
            shopping: 'Shopping'
        },
        filters: {
            all: 'All',
            restaurants: 'Restaurants',
            attractions: 'Attractions',
            activities: 'Activities',
            shopping: 'Shopping'
        }
    },
    ar: {
        searchPlaceholder: 'ابحث عن وجهات، مطاعم، أنشطة...',
        searching: 'جاري البحث...',
        noResults: 'لم يتم العثور على نتائج',
        tryDifferent: 'جرب كلمات مفتاحية مختلفة أو تحقق من الإملاء',
        resultsFound: 'نتيجة',
        categories: {
            all: 'جميع النتائج',
            restaurants: 'مطاعم',
            attractions: 'معالم سياحية',
            activities: 'أنشطة',
            shopping: 'تسوق'
        },
        filters: {
            all: 'الكل',
            restaurants: 'مطاعم',
            attractions: 'معالم',
            activities: 'أنشطة',
            shopping: 'تسوق'
        }
    },
    fr: {
        searchPlaceholder: 'Rechercher destinations, restaurants, activités...',
        searching: 'Recherche en cours...',
        noResults: 'Aucun résultat trouvé',
        tryDifferent: 'Essayez différents mots-clés ou vérifiez l\'orthographe',
        resultsFound: 'résultats trouvés',
        categories: {
            all: 'Tous les résultats',
            restaurants: 'Restaurants',
            attractions: 'Attractions',
            activities: 'Activités',
            shopping: 'Shopping'
        },
        filters: {
            all: 'Tout',
            restaurants: 'Restaurants',
            attractions: 'Attractions',
            activities: 'Activités',
            shopping: 'Shopping'
        }
    }
};

const governorateTranslations_advanced = {
    en: {
        'Giza': 'Giza', 'Cairo': 'Cairo', 'Luxor': 'Luxor', 'Aswan': 'Aswan',
        'Alexandria': 'Alexandria', 'Red Sea': 'Red Sea', 'South Sinai': 'South Sinai',
        'North Sinai': 'North Sinai', 'Matrouh': 'Matrouh', 'New Valley': 'New Valley',
        'Fayoum': 'Fayoum', 'Qena': 'Qena', 'Sohag': 'Sohag', 'Beheira': 'Beheira',
        'Kafr El Sheikh': 'Kafr El Sheikh', 'Dakahlia': 'Dakahlia', 'Gharbia': 'Gharbia',
        'Sharqia': 'Sharqia', 'Monufia': 'Monufia', 'Qalyubia': 'Qalyubia',
        'Beni Suef': 'Beni Suef', 'Minya': 'Minya', 'Assiut': 'Assiut',
        'Port Said': 'Port Said', 'Ismailia': 'Ismailia', 'Suez': 'Suez', 'Damietta': 'Damietta'
    },
    ar: {
        'Giza': 'الجيزة', 'Cairo': 'القاهرة', 'Luxor': 'الأقصر', 'Aswan': 'أسوان',
        'Alexandria': 'الإسكندرية', 'Red Sea': 'البحر الأحمر', 'South Sinai': 'جنوب سيناء',
        'North Sinai': 'شمال سيناء', 'Matrouh': 'مطروح', 'New Valley': 'الوادي الجديد',
        'Fayoum': 'الفيوم', 'Qena': 'قنا', 'Sohag': 'سوهاج', 'Beheira': 'البحيرة',
        'Kafr El Sheikh': 'كفر الشيخ', 'Dakahlia': 'الدقهلية', 'Gharbia': 'الغربية',
        'Sharqia': 'الشرقية', 'Monufia': 'المنوفية', 'Qalyubia': 'القليوبية',
        'Beni Suef': 'بني سويف', 'Minya': 'المنيا', 'Assiut': 'أسيوط',
        'Port Said': 'بورسعيد', 'Ismailia': 'الإسماعيلية', 'Suez': 'السويس', 'Damietta': 'دمياط'
    },
    fr: {
        'Giza': 'Gizeh', 'Cairo': 'Le Caire', 'Luxor': 'Louxor', 'Aswan': 'Assouan',
        'Alexandria': 'Alexandrie', 'Red Sea': 'Mer Rouge', 'South Sinai': 'Sinaï du Sud',
        'North Sinai': 'Sinaï du Nord', 'Matrouh': 'Matrouh', 'New Valley': 'Nouvelle Vallée',
        'Fayoum': 'Fayoum', 'Qena': 'Qena', 'Sohag': 'Sohag', 'Beheira': 'Beheira',
        'Kafr El Sheikh': 'Kafr El Sheikh', 'Dakahlia': 'Dakahlia', 'Gharbia': 'Gharbia',
        'Sharqia': 'Sharqia', 'Monufia': 'Monufia', 'Qalyubia': 'Qalyubia',
        'Beni Suef': 'Beni Suef', 'Minya': 'Minya', 'Assiut': 'Assiut',
        'Port Said': 'Port-Saïd', 'Ismailia': 'Ismaïlia', 'Suez': 'Suez', 'Damietta': 'Damiette'
    }
};

const arabicNormalizationMap = {
    'أ': 'ا', '��': 'ا', 'آ': 'ا', 'ٱ': 'ا',
    'ة': 'ه', 'ى': 'ي',
    'ؤ': 'و', 'ئ': 'ي'
};

let searchModal, searchInput, searchResults, searchNoResults;
let currentFilter = 'all';
let searchDebounceTimer = null;
let lastSearchTerm = '';

function initializeAdvancedSearch() {
    searchModal = document.getElementById('search-modal');
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    searchNoResults = document.getElementById('search-no-results');

    const desktopSearchBtn = document.getElementById('desktop-search-btn');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const searchClose = document.getElementById('search-close');

    if (desktopSearchBtn) {
        desktopSearchBtn.addEventListener('click', openSearchModal);
    }

    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', () => {
            openSearchModal();
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) navMenu.classList.remove('active');
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', closeSearchModal);
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                performAdvancedSearch(e.target.value);
            }, 300);
        });

        updateSearchPlaceholder();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    createSearchFilters();
}

function createSearchFilters() {
    let filterContainer = document.querySelector('.search-filters');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.className = 'search-filters';

        const searchContent = document.querySelector('.search-content');
        if (searchContent) {
            filterContainer.style.marginTop = '0.75rem';
            searchContent.insertBefore(filterContainer, searchResults);
        }
    }

    const currentLang = getCurrentLanguage();
    const filters = searchTranslations[currentLang].filters;

    filterContainer.innerHTML = '';
    Object.keys(filters).forEach(filterKey => {
        const button = document.createElement('button');
        button.className = `filter-btn ${filterKey === 'all' ? 'active' : ''}`;
        button.textContent = filters[filterKey];
        button.setAttribute('data-filter', filterKey);

        button.addEventListener('click', () => {
            currentFilter = filterKey;
            document.querySelectorAll('.search-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (searchInput) performAdvancedSearch(searchInput.value);
        });

        filterContainer.appendChild(button);
    });
}

function updateSearchPlaceholder() {
    if (!searchInput) return;
    const currentLang = getCurrentLanguage();
    searchInput.placeholder = searchTranslations[currentLang].searchPlaceholder;
}

function openSearchModal() {
    if (!searchModal) return;
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
    }

    updateSearchPlaceholder();
    createSearchFilters();
}

function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('active');
    document.body.style.overflow = '';

    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';

    if (searchNoResults) {
        searchNoResults.style.display = 'none';
    }

    currentFilter = 'all';
    lastSearchTerm = '';
}

function normalizeArabicText(text) {
    if (!text) return '';
    let normalized = text.toLowerCase();
    for (const [char, replacement] of Object.entries(arabicNormalizationMap)) {
        normalized = normalized.replace(new RegExp(char, 'g'), replacement);
    }
    normalized = normalized.replace(/[\u064B-\u0652]/g, '');
    return normalized;
}

function calculateMatchScore(place, searchTerms, currentLang) {
    let score = 0;

    const nameEn = (place.name || '').toLowerCase();
    const nameAr = normalizeArabicText(place.nameAr || '');
    const nameFr = (place.nameFr || '').toLowerCase();

    const descEn = (place.description || '').toLowerCase();
    const descAr = normalizeArabicText(place.descriptionAr || '');
    const descFr = (place.descriptionFr || '').toLowerCase();

    const governorate = (place.governorate || '').toLowerCase();
    const category = (place.category || '').toLowerCase();

    // Also match translated governorate names
    const govEn = governorateTranslations.en[place.governorate] || '';
    const govAr = governorateTranslations.ar[place.governorate] || '';
    const govFr = governorateTranslations.fr[place.governorate] || '';

    searchTerms.forEach(term => {
        const normalizedTerm = normalizeArabicText(term);

        // name match
        if (nameEn.includes(term)) score += 10;
        if (nameAr.includes(normalizedTerm)) score += 10;
        if (nameFr.includes(term)) score += 10;

        // exact name match
        if (nameEn === term) score += 20;
        if (nameAr === normalizedTerm) score += 20;
        if (nameFr === term) score += 20;

        // prefix
        if (nameEn.startsWith(term)) score += 15;
        if (nameAr.startsWith(normalizedTerm)) score += 15;
        if (nameFr.startsWith(term)) score += 15;

        // governorate
        if (governorate.includes(term)) score += 8;
        if (govEn.toLowerCase().includes(term)) score += 8;
        if (normalizeArabicText(govAr).includes(normalizedTerm)) score += 8;
        if (govFr.toLowerCase().includes(term)) score += 8;

        // category
        if (category.includes(term)) score += 6;

        // description
        if (descEn.includes(term)) score += 3;
        if (descAr.includes(normalizedTerm)) score += 3;
        if (descFr.includes(term)) score += 3;
    });

    if (currentLang === 'ar' && nameAr) score += 5;
    if (currentLang === 'fr' && nameFr) score += 5;
    if (currentLang === 'en' && nameEn) score += 5;

    return score;
}

function performAdvancedSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm || searchTerm.length < 2) {
        if (searchResults) searchResults.innerHTML = '';
        if (searchNoResults) searchNoResults.style.display = 'none';
        return;
    }

    if (searchTerm === lastSearchTerm) return;
    lastSearchTerm = searchTerm;

    const currentLang = getCurrentLanguage();

    if (searchResults) {
        searchResults.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${searchTranslations[currentLang].searching}</p>
            </div>
        `;
    }

    setTimeout(() => {
        executeSearch(searchTerm, currentLang);
    }, 100);
}

function executeSearch(searchTerm, currentLang) {
    const allPlaces = placesData?.places || [];
    if (allPlaces.length === 0) {
        console.warn('⚠️ No places data available');
        displayNoResults(currentLang);
        return;
    }

    const searchTerms = searchTerm.split(/\s+/).filter(t => t.length > 1);

    const scoredPlaces = allPlaces.map(place => ({
        place,
        score: calculateMatchScore(place, searchTerms, currentLang)
    })).filter(item => item.score > 0);

    let filtered = scoredPlaces;
    if (currentFilter !== 'all') {
        filtered = scoredPlaces.filter(item => item.place.category === currentFilter);
    }

    filtered.sort((a, b) => b.score - a.score);
    const results = filtered.slice(0, 50).map(item => item.place);

    displaySearchResults(results, currentLang);
}

function displaySearchResults(places, currentLang) {
    if (!searchResults) return;
    searchResults.innerHTML = '';

    if (places.length === 0) {
        displayNoResults(currentLang);
        return;
    } else {
        if (searchNoResults) searchNoResults.style.display = 'none';
    }

    const resultsCount = document.createElement('div');
    resultsCount.className = 'search-results-count';
    resultsCount.textContent = `${places.length} ${searchTranslations[currentLang].resultsFound}`;
    searchResults.appendChild(resultsCount);

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-container';

    places.forEach(place => {
        const resultItem = createSearchResultItem(place, currentLang);
        resultsContainer.appendChild(resultItem);
    });

    searchResults.appendChild(resultsContainer);
}

function displayNoResults(currentLang) {
    if (!searchNoResults) return;

    searchNoResults.style.display = 'block';
    searchNoResults.innerHTML = `
        <i class="fas fa-search"></i>
        <h3>${searchTranslations[currentLang].noResults}</h3>
        <p>${searchTranslations[currentLang].tryDifferent}</p>
    `;

    if (searchResults) {
        searchResults.innerHTML = '';
    }
}

function createSearchResultItem(place, currentLang) {
    const item = document.createElement('div');
    item.className = 'search-result-item';

    let placeName = place.name;
    if (currentLang === 'ar' && place.nameAr) {
        placeName = place.nameAr;
    } else if (currentLang === 'fr' && place.nameFr) {
        placeName = place.nameFr;
    }

    let description = place.description || '';
    if (currentLang === 'ar' && place.descriptionAr) {
        description = place.descriptionAr;
    } else if (currentLang === 'fr' && place.descriptionFr) {
        description = place.descriptionFr;
    }

    if (description.length > 120) {
        description = description.substring(0, 120) + '...';
    }

    const governorateName = governorateTranslations_advanced[currentLang][place.governorate] || place.governorate;

    const categoryIcons = {
        restaurants: 'fa-utensils',
        attractions: 'fa-landmark',
        activities: 'fa-running',
        shopping: 'fa-shopping-bag'
    };

    const categoryIcon = categoryIcons[place.category] || 'fa-map-marker-alt';
    const categoryName = searchTranslations[currentLang].categories[place.category] || place.category;

    item.innerHTML = `
        <div class="result-icon">
            <i class="fas ${categoryIcon}"></i>
        </div>
        <div class="result-content">
            <h4 class="result-title">${placeName}</h4>
            <p class="result-description">${description}</p>
            <div class="result-meta">
                <span class="result-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${governorateName}
                </span>
                <span class="result-category">
                    <i class="fas fa-tag"></i>
                    ${categoryName}
                </span>
            </div>
        </div>
    `;

    item.addEventListener('click', () => {
        closeSearchModal();
        showPlaceDetails(place);
    });

    return item;
}

function showPlaceDetails(_place) {
    // Placeholder for future details panel
}

function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

document.addEventListener('languageChanged', () => {
    updateSearchPlaceholder();
    createSearchFilters();
    if (searchInput && searchInput.value.trim().length >= 2) {
        performAdvancedSearch(searchInput.value);
    }
});

window.addEventListener('languagechange', () => {
    updateSearchPlaceholder();
    createSearchFilters();
    if (searchInput && searchInput.value.trim().length >= 2) {
        performAdvancedSearch(searchInput.value);
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdvancedSearch);
} else {
    initializeAdvancedSearch();
}

window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.performAdvancedSearch = performAdvancedSearch;

/* ===== js/user-menu-enhanced.js (cleaned) ===== */

let currentUserMenu = null;
let userMenuInitialized = false;

function initializeUserMenu() {
    if (userMenuInitialized) return;

    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }

    document.addEventListener('click', (e) => {
        const userMenuContainer = document.getElementById('user-menu-container');
        const userDropdown = document.getElementById('user-dropdown');
        if (userMenuContainer && userDropdown) {
            if (!userMenuContainer.contains(e.target) && userDropdown.classList.contains('show')) {
                closeUserDropdown();
            }
        }
    });

    setupAuthObserver();
    userMenuInitialized = true;
}

function setupAuthObserver() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        setTimeout(setupAuthObserver, 500);
        return;
    }

    firebase.auth().onAuthStateChanged((user) => {
        currentUserMenu = user;
        updateAuthUI(user);
    });
}

function updateAuthUI(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenuContainer = document.getElementById('user-menu-container');
    const authMobileItem = document.getElementById('auth-mobile-item');
    const mobileUserProfile = document.getElementById('mobile-user-profile');

    if (user) {
        if (authButtons) {
            authButtons.style.display = 'none';
            authButtons.classList.remove('show');
        }
        if (authMobileItem) {
            authMobileItem.style.display = 'none';
        }
        if (userMenuContainer) {
            userMenuContainer.style.display = 'flex';
            userMenuContainer.classList.add('show');
        }
        if (mobileUserProfile) {
            mobileUserProfile.classList.add('show');
            updateMobileUserProfile(user);
        }
        updateUserInfo(user);
        loadUserPlansCount();
    } else {
        if (authButtons) {
            authButtons.style.display = 'flex';
            authButtons.classList.add('show');
        }
        if (authMobileItem) {
            authMobileItem.style.display = 'list-item';
        }
        if (userMenuContainer) {
            userMenuContainer.style.display = 'none';
            userMenuContainer.classList.remove('show');
        }
        if (mobileUserProfile) {
            mobileUserProfile.classList.remove('show');
        }
    }
}

function updateUserInfo(user) {
    const displayName = user.displayName || user.email.split('@')[0];
    const email = user.email;
    const photoURL = user.photoURL || getDefaultAvatar(displayName);

    const providerData = user.providerData;

    let authMethodText = {
        ar: 'حساب بالبريد الإلكتروني',
        en: 'Email Account',
        fr: 'Compte Email'
    };

    let authMethodIcon = 'fas fa-envelope';

    if (providerData && providerData.length > 0) {
        const providerId = providerData[0].providerId;
        if (providerId === 'google.com') {
            authMethodText = {
                ar: 'حساب جوجل',
                en: 'Google Account',
                fr: 'Compte Google'
            };
            authMethodIcon = 'fab fa-google';
        }
    }

    const userPhoto = document.getElementById('user-photo');
    if (userPhoto) {
        userPhoto.src = photoURL;
        userPhoto.alt = displayName;
        userPhoto.onerror = () => {
            userPhoto.src = getDefaultAvatar(displayName);
        };
    }

    const userPhotoLarge = document.getElementById('user-photo-large');
    if (userPhotoLarge) {
        userPhotoLarge.src = photoURL;
        userPhotoLarge.alt = displayName;
        userPhotoLarge.onerror = () => {
            userPhotoLarge.src = getDefaultAvatar(displayName);
        };
    }

    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName) {
        userDisplayName.textContent = displayName;
    }

    const userNameDropdown = document.getElementById('user-name-dropdown');
    if (userNameDropdown) {
        userNameDropdown.textContent = displayName;
    }

    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = email;
    }

    const userAuthMethod = document.getElementById('user-auth-method');
    if (userAuthMethod) {
        const currentLang = localStorage.getItem('language') || 'en';
        const iconElement = userAuthMethod.querySelector('i');
        const textElement = userAuthMethod.querySelector('span');

        if (iconElement) {
            iconElement.className = authMethodIcon;
        }

        if (textElement) {
            textElement.textContent = authMethodText[currentLang] || authMethodText.en;
        }
    }
}

function getDefaultAvatar(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    const svg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="${color}"/>
            <text x="50" y="50" font-size="45" fill="white"
                  text-anchor="middle" dominant-baseline="central"
                  font-family="Arial, sans-serif" font-weight="bold">
                ${firstLetter}
            </text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;

    const isOpen = dropdown.classList.contains('show');
    if (isOpen) {
        closeUserDropdown();
    } else {
        openUserDropdown();
    }
}

function openUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;

    dropdown.classList.add('show');

    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) {
        const chevron = userMenuBtn.querySelector('.fa-chevron-down');
        if (chevron) {
            chevron.classList.remove('fa-chevron-down');
            chevron.classList.add('fa-chevron-up');
        }
    }
}

function closeUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;

    dropdown.classList.remove('show');

    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) {
        const chevron = userMenuBtn.querySelector('.fa-chevron-up');
        if (chevron) {
            chevron.classList.remove('fa-chevron-up');
            chevron.classList.add('fa-chevron-down');
        }
    }
}

function toggleMobileUserMenu() {
    const menuItems = document.getElementById('mobile-user-menu-items');
    const chevron = document.getElementById('mobile-user-chevron');
    if (!menuItems) return;

    const isOpen = menuItems.classList.contains('open');
    if (isOpen) {
        menuItems.classList.remove('open');
        menuItems.style.display = '';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    } else {
        menuItems.classList.add('open');
        menuItems.style.display = '';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
}

function openSavedPlansFromDropdown() {
    closeUserDropdown();
    setTimeout(() => {
        if (typeof openSavedPlansModal === 'function') {
            openSavedPlansModal();
        } else {
            console.error('openSavedPlansModal function not found');
        }
    }, 100);
}

async function loadUserPlansCount() {
    if (!currentUserMenu) return;

    const countElement = document.getElementById('dropdown-plans-count');
    if (!countElement) return;

    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            const plansRef = db.collection('users').doc(currentUserMenu.uid).collection('savedPlans');
            const snapshot = await plansRef.get();
            const count = snapshot.size;

            countElement.textContent = String(count);
            countElement.style.display = count > 0 ? 'inline-block' : 'none';

            const mainCountElement = document.getElementById('saved-plans-count');
            if (mainCountElement) {
                mainCountElement.textContent = String(count);
            }
        }
    } catch (error) {
        console.error('❌ Error loading plans count:', error);
        countElement.textContent = '0';
    }
}

async function handleLogout() {
    if (!confirm(getCurrentLangText({
        ar: 'هل أنت متأكد من تسجيل الخروج؟',
        en: 'Are you sure you want to logout?',
        fr: 'Êtes-vous sûr de vouloir vous déconnecter?'
    }))) {
        return;
    }

    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut();
            alert(getCurrentLangText({
                ar: 'تم تسجيل الخروج بنجاح',
                en: 'Logged out successfully',
                fr: 'Déconnexion réussie'
            }));
            window.location.reload();
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert(getCurrentLangText({
            ar: 'حدث خطأ في تسجيل الخروج',
            en: 'Error logging out',
            fr: 'Erreur de déconnexion'
        }));
    }
}

function updateMobileUserProfile(user) {
    if (!user) return;

    const displayName = user.displayName || user.email.split('@')[0];
    const email = user.email;
    const photoURL = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=d4af37&color=fff&size=128';

    const mobileUserPhoto = document.getElementById('mobile-user-photo');
    const mobileUserName = document.getElementById('mobile-user-name');
    const mobileUserEmail = document.getElementById('mobile-user-email');
    const mobilePlansCount = document.getElementById('mobile-plans-count');

    if (mobileUserPhoto) mobileUserPhoto.src = photoURL;
    if (mobileUserName) mobileUserName.textContent = displayName;
    if (mobileUserEmail) mobileUserEmail.textContent = email;

    if (mobilePlansCount && window.userPlansCount !== undefined) {
        mobilePlansCount.textContent = window.userPlansCount || '0';
    }
}

function getCurrentLangText(translations) {
    const currentLang = localStorage.getItem('language') || 'en';
    return translations[currentLang] || translations.en;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUserMenu);
} else {
    initializeUserMenu();
}

window.toggleUserDropdown = toggleUserDropdown;
window.openUserDropdown = openUserDropdown;
window.closeUserDropdown = closeUserDropdown;
window.handleLogout = handleLogout;
window.openSavedPlansFromDropdown = openSavedPlansFromDropdown;
window.loadUserPlansCount = loadUserPlansCount;
window.toggleMobileUserMenu = toggleMobileUserMenu;

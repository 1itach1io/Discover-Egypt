


function initializeLanguage() {
    const languageSelector = document.getElementById('language-selector');
    const languageRadios = document.querySelectorAll('input[name="language"]');
    const autoDetectCheckbox = document.getElementById('auto-detect-lang');

    const autoDetect = localStorage.getItem('autoDetectLang') !== 'false';
    if (autoDetectCheckbox) autoDetectCheckbox.checked = autoDetect;

    let lang = localStorage.getItem('language') || 'en';
    if (autoDetect) {
        const browserLang = navigator.language.substring(0, 2);
        if (['en', 'ar', 'fr'].includes(browserLang)) lang = browserLang;
    }

    setLanguage(lang);

    if (languageSelector) {
        languageSelector.addEventListener('change', (e) => setLanguage(e.target.value));
    }

    languageRadios.forEach(radio => {
        radio.addEventListener('change', (e) => e.target.checked && setLanguage(e.target.value));
    });

    if (autoDetectCheckbox) {
        autoDetectCheckbox.addEventListener('change', function() {
            localStorage.setItem('autoDetectLang', this.checked);
            if (this.checked) {
                const browserLang = navigator.language.substring(0, 2);
                if (['en', 'ar', 'fr'].includes(browserLang)) setLanguage(browserLang);
            }
        });
    }
}

function setLanguage(lang) {
    window.currentLanguage = lang;

    function initializeLanguage() {
        const languageSelector = document.getElementById('language-selector');
        const languageRadios = document.querySelectorAll('input[name="language"]');
        const autoDetectCheckbox = document.getElementById('auto-detect-lang');

        const autoDetect = localStorage.getItem('autoDetectLang') !== 'false';
        if (autoDetectCheckbox) autoDetectCheckbox.checked = autoDetect;

        let lang = localStorage.getItem('language') || 'en';
        if (autoDetect) {
            const browserLang = navigator.language.substring(0, 2);
            if (['en', 'ar', 'fr'].includes(browserLang)) lang = browserLang;
        }

        setLanguage(lang);

        if (languageSelector && !languageSelector.__bound) {
            languageSelector.addEventListener('change', (e) => setLanguage(e.target.value));
            languageSelector.__bound = true;
        }

        languageRadios.forEach(radio => {
            if (!radio.__bound) {
                radio.addEventListener('change', (e) => e.target.checked && setLanguage(e.target.value));
                radio.__bound = true;
            }
        });

        if (autoDetectCheckbox && !autoDetectCheckbox.__bound) {
            autoDetectCheckbox.addEventListener('change', function() {
                localStorage.setItem('autoDetectLang', this.checked);
                if (this.checked) {
                    const browserLang = navigator.language.substring(0, 2);
                    if (['en', 'ar', 'fr'].includes(browserLang)) setLanguage(browserLang);
                }
            });
            autoDetectCheckbox.__bound = true;
        }
    }

    function setLanguage(lang) {
        window.currentLanguage = lang;
        currentLanguage = lang;

        localStorage.setItem('language', lang);
        document.dispatchEvent(new CustomEvent('languageChange', { detail: { lang } }));

        if (typeof translations !== 'undefined' && Object.keys(translations).length > 0) {
            applyTranslations();
        }
    }

    function initializeMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const body = document.body;

        if (!mobileToggle || !navMenu) {
            console.warn('initializeMobileMenu: missing elements', { mobileToggle, navMenu });
            return;
        }

        let overlay = document.querySelector('.mobile-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            body.appendChild(overlay);
        }

        if (!mobileToggle.hasAttribute('aria-expanded')) {
            mobileToggle.setAttribute('aria-expanded', 'false');
        }

        if (!mobileToggle.__menuBound) {
            mobileToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleMenu();
            });
            mobileToggle.__menuBound = true;
        }

        function adjustLanguagePlacement() {
            const selector = document.getElementById('language-selector');
            if (!selector) return;
            const navControls = document.querySelector('.nav-controls');
            const mobileLiId = 'mobile-lang-container';
            if (window.innerWidth <= 768) {
                if (!document.getElementById(mobileLiId)) {
                    const li = document.createElement('li');
                    li.id = mobileLiId;
                    li.className = 'mobile-menu-item';
                    li.appendChild(selector);
                    navMenu.appendChild(li);
                }
            } else {
                const mobileLi = document.getElementById(mobileLiId);
                if (mobileLi && navControls) {
                    navControls.insertBefore(selector, navControls.firstChild);
                    mobileLi.remove();
                }
            }
        }

        adjustLanguagePlacement();
        let _resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(adjustLanguagePlacement, 120);
        });

        if (!overlay.__overlayBound) {
            overlay.addEventListener('click', function () { closeMenu(); });
            overlay.__overlayBound = true;
        }

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (!link.__menuCloseBound) {
                link.addEventListener('click', function () { closeMenu(); });
                link.__menuCloseBound = true;
            }
        });

        if (!document.__mobileKeyBound) {
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu(); });
            document.__mobileKeyBound = true;
        }

        function toggleMenu() {
            if (window.innerWidth > 768) return;
            const willOpen = !navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            overlay.classList.toggle('active', willOpen);
            body.style.overflow = willOpen ? 'hidden' : '';
            mobileToggle.setAttribute('aria-expanded', String(willOpen));
            if (willOpen) {
                const firstFocusable = navMenu.querySelector('a, button, input, select');
                if (firstFocusable) firstFocusable.focus();
            }
        }

        function closeMenu() {
            if (!navMenu.classList.contains('active')) return;
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }

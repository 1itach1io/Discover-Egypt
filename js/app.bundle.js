/*
 * app.bundle.js
 * Purpose: Reduce script tags by bundling stable, non-Firebase, non-third-party modules.
 * Includes:
 *  - js/core/navigation.js
 *  - js/core/theme.js
 *  - js/core/language.js
 *  - js/language-fixes.js
 * Notes:
 *  - Keep modules that depend on Firebase loading order separate (auth-system, saved-plans, etc.)
 *  - This file is intentionally vanilla (no build step required).
 */

/* ===== js/core/navigation.js ===== */

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            sections.forEach(s => s.classList.remove('active'));
            const activeSection = document.getElementById(targetSection);
            if (activeSection) activeSection.classList.add('active');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            document.querySelector('.nav-menu')?.classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const ctaButton = document.querySelector('.cta-button');
    ctaButton?.addEventListener('click', () => {
        document.querySelector('[data-section="plans"]')?.click();
    });
}

// Tool cards navigation (kept exactly as-is)
document.addEventListener('DOMContentLoaded', () => {
    const toolButtons = document.querySelectorAll('.tool-card');
    const sections = document.querySelectorAll('.section');

    toolButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            sections.forEach(sec => sec.classList.remove('visible'));
            if (targetSection) {
                targetSection.classList.add('visible');
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

function initializeTools() {}

/* ===== js/core/theme.js ===== */

function initializeTheme() {
    // Elements are optional depending on the page
    const themeOptionBtns = document.querySelectorAll('.theme-option-btn');
    const autoDetectThemeCheckbox = document.getElementById('auto-detect-theme');
    const reducedMotionCheckbox = document.getElementById('reduced-motion');
    const highContrastCheckbox = document.getElementById('high-contrast');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Default behavior: auto-detect ON unless user turned it off
    const autoDetect = localStorage.getItem('autoDetectTheme') !== 'false';
    if (autoDetectThemeCheckbox) autoDetectThemeCheckbox.checked = autoDetect;

    // Resolve initial theme
    const storedTheme = localStorage.getItem('theme');
    const isManual = localStorage.getItem('theme-manual') === 'true';

    const initialTheme = (autoDetect && !isManual)
        ? (prefersDarkScheme.matches ? 'dark' : 'light')
        : (storedTheme || (prefersDarkScheme.matches ? 'dark' : 'light'));

    applyTheme(initialTheme, false);

    // React to system theme changes only when auto-detect is enabled AND user didn't manually force a theme
    prefersDarkScheme.addEventListener('change', (e) => {
        const autoDetectNow = autoDetectThemeCheckbox ? autoDetectThemeCheckbox.checked : (localStorage.getItem('autoDetectTheme') !== 'false');
        const isManualNow = localStorage.getItem('theme-manual') === 'true';

        if (autoDetectNow && !isManualNow) {
            applyTheme(e.matches ? 'dark' : 'light', false);
        }
    });

    // Optional quick toggle button (if exists)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true);

            if (autoDetectThemeCheckbox) {
                autoDetectThemeCheckbox.checked = false;
                localStorage.setItem('autoDetectTheme', 'false');
            }
        });
    }

    // Theme option buttons (settings page)
    themeOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            if (!theme) return;

            applyTheme(theme, true);

            themeOptionBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (autoDetectThemeCheckbox) {
                autoDetectThemeCheckbox.checked = false;
                localStorage.setItem('autoDetectTheme', 'false');
            }
        });
    });

    // Auto-detect checkbox
    if (autoDetectThemeCheckbox) {
        autoDetectThemeCheckbox.addEventListener('change', function() {
            localStorage.setItem('autoDetectTheme', String(this.checked));

            if (this.checked) {
                // Clear manual override when the user enables auto detect
                localStorage.setItem('theme-manual', 'false');

                const newTheme = prefersDarkScheme.matches ? 'dark' : 'light';
                applyTheme(newTheme, false);
            }
        });
    }

    // Accessibility toggles
    const initAccessibilitySetting = (checkbox, storageKey, className) => {
        if (!checkbox) return;
        const savedState = localStorage.getItem(storageKey) === 'true';
        checkbox.checked = savedState;
        if (savedState) document.documentElement.classList.add(className);
        checkbox.addEventListener('change', function() {
            localStorage.setItem(storageKey, String(this.checked));
            this.checked
                ? document.documentElement.classList.add(className)
                : document.documentElement.classList.remove(className);
        });
    };

    initAccessibilitySetting(reducedMotionCheckbox, 'reducedMotion', 'reduced-motion');
    initAccessibilitySetting(highContrastCheckbox, 'highContrast', 'high-contrast');

    function applyTheme(theme, manual = false) {
        const normalized = theme === 'dark' ? 'dark' : 'light';

        // Apply attribute (CSS variables are defined on [data-theme="dark"] and :root)
        document.documentElement.classList.add('theme-transitioning');
        document.documentElement.setAttribute('data-theme', normalized);

        // Persist
        localStorage.setItem('theme', normalized);
        if (manual) {
            localStorage.setItem('theme-manual', 'true');
            localStorage.setItem('autoDetectTheme', 'false');
        }

        // Update settings buttons state if present
        themeOptionBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === normalized);
        });

        // Fire an event so any other module can react if needed
        try {
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: normalized } }));
        } catch (_) {
            // ignore
        }

        setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300);
    }

    // Transition helper style (idempotent)
    if (!document.getElementById('theme-transition-style')) {
        const style = document.createElement('style');
        style.id = 'theme-transition-style';
        style.textContent = '.theme-transitioning,.theme-transitioning*{transition:background-color .3s ease,color .3s ease,border-color .3s ease,box-shadow .3s ease !important}';
        document.head.appendChild(style);
    }
}

/* ===== js/core/language.js ===== */

function initializeLanguage() {
    const languageSelector = document.getElementById('language-selector');
    const languageRadios = document.querySelectorAll('input[name="language"]');
    const autoDetectLangCheckbox = document.getElementById('auto-detect-lang');

    let savedLang = localStorage.getItem('language') || 'en';
    const autoDetect = localStorage.getItem('autoDetectLang') !== 'false';

    if (autoDetectLangCheckbox) autoDetectLangCheckbox.checked = autoDetect;

    if (autoDetect) {
        const browserLang = (navigator.language || 'en').slice(0, 2);
        if (['en', 'ar', 'fr'].includes(browserLang)) {
            savedLang = browserLang;
        }
    }

    setLanguage(savedLang);

    if (languageSelector) {
        languageSelector.value = savedLang;
        languageSelector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    languageRadios.forEach(radio => {
        radio.checked = radio.value === savedLang;
        radio.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    });

    if (autoDetectLangCheckbox) {
        autoDetectLangCheckbox.addEventListener('change', function () {
            localStorage.setItem('autoDetectLang', String(this.checked));
            if (this.checked) {
                const browserLang = (navigator.language || 'en').slice(0, 2);
                if (['en', 'ar', 'fr'].includes(browserLang)) {
                    setLanguage(browserLang);
                }
            }
        });
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);

        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }

        // Broadcast for other modules
        try {
            window.dispatchEvent(new Event('languagechange'));
        } catch (_) {
            // ignore
        }

        applyTranslations();
    }
}

/* ===== js/language-fixes.js ===== */

// Small compatibility helpers for older markup/code.
// Avoids runtime errors if some functions are referenced.
(function () {
    'use strict';

    // No-op placeholders if not defined elsewhere
    window.initializeMobileMenu = window.initializeMobileMenu || function () {};
})();

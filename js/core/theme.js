


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

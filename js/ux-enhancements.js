// ux-enhancements.js
// lightweight script for inserting theme toggle and keeping UI enhancements isolated

(function() {
    function insertThemeToggle() {
        const navControls = document.querySelector('.nav-controls');
        if (!navControls) return;
        if (document.getElementById('theme-toggle')) return; // already exists

        const btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.className = 'theme-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle dark/light theme');
        btn.setAttribute('title', 'Toggle theme');
        // start with a default symbol, icon will be updated by updateToggleIcon
        btn.setAttribute('aria-pressed', 'false');
        btn.innerHTML = '<i class="fas fa-moon" aria-hidden="true"></i>';

        // insert before language selector (first child) or at end
        if (navControls.firstChild) {
            navControls.insertBefore(btn, navControls.firstChild);
        } else {
            navControls.appendChild(btn);
        }
    }

    function updateToggleIcon(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        let iconHtml = '';
        if (theme === 'dark') {
            iconHtml = '<i class="fas fa-sun" aria-hidden="true"></i>';
            btn.setAttribute('aria-label', 'Switch to light mode');
            btn.setAttribute('title', 'Switch to light mode');
            btn.setAttribute('aria-pressed','true');
        } else {
            iconHtml = '<i class="fas fa-moon" aria-hidden="true"></i>';
            btn.setAttribute('aria-label', 'Switch to dark mode');
            btn.setAttribute('title', 'Switch to dark mode');
            btn.setAttribute('aria-pressed','false');
        }
        btn.innerHTML = iconHtml;
    }

    function setupThemeButton() {
        insertThemeToggle();
        // set correct icon on load
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        updateToggleIcon(current);

        // attach our own toggle listener in case theme.js didn't find button
        const btn = document.getElementById('theme-toggle');
        if (btn && !btn.__uxHasListener) {
            btn.addEventListener('click', function() {
                const html = document.documentElement;
                const currentTheme = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
                const next = currentTheme === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                localStorage.setItem('theme-manual', 'true');
                localStorage.setItem('autoDetectTheme', 'false');
                updateToggleIcon(next);
                try {
                    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
                } catch (e) {}
            });
            btn.__uxHasListener = true;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupThemeButton);
    } else {
        setupThemeButton();
    }

    // listen for themechange from theme.js
    window.addEventListener('themechange', function(e) {
        updateToggleIcon(e.detail.theme);
    });
})();

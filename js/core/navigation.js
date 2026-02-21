


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


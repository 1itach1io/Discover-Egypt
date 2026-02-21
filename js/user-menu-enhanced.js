'use strict';
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
        ;
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
    ;
}
function updateUserInfo(user) {
    const displayName = user.displayName || user.email.split('@')[0];
    const email = user.email;
    const photoURL = user.photoURL || getDefaultAvatar(displayName);
    const providerData = user.providerData;
    let authMethod = 'email'; 
    let authMethodText = {
        ar: 'حساب بالبريد الإلكتروني',
        en: 'Email Account',
        fr: 'Compte Email'
    };
    let authMethodIcon = 'fas fa-envelope';
    if (providerData && providerData.length > 0) {
        const providerId = providerData[0].providerId;
        if (providerId === 'google.com') {
            authMethod = 'google';
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
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'inline-block' : 'none';
            const mainCountElement = document.getElementById('saved-plans-count');
            if (mainCountElement) {
                mainCountElement.textContent = count;
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
            ;
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
    ;
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
;

// ===================================
// MOBILE DETECTION & VERSION ROUTER
// ===================================

// Detect if user is on mobile device
function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for mobile user agents
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobile = mobileRegex.test(userAgent.toLowerCase());

    // Check screen size as backup
    const isSmallScreen = window.innerWidth <= 768;

    return isMobile || isSmallScreen;
}

// Check if user has preference stored
function getUserVersionPreference() {
    return localStorage.getItem('mysafety_version_preference');
}

// Set user version preference
function setUserVersionPreference(version) {
    localStorage.setItem('mysafety_version_preference', version);
}

// Route to appropriate version
function routeToVersion() {
    const currentPage = window.location.pathname;
    const preference = getUserVersionPreference();
    const isMobile = isMobileDevice();

    // Don't redirect on auth page or if already on correct version
    if (currentPage.includes('auth.html')) {
        return; // Let auth page load normally
    }

    // If user has preference, respect it
    if (preference === 'desktop' && currentPage.includes('dashboard-mobile.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (preference === 'mobile' && currentPage === '/dashboard.html') {
        window.location.href = 'dashboard-mobile.html';
        return;
    }

    // Auto-detect and route
    if (isMobile && currentPage === '/dashboard.html') {
        window.location.href = 'dashboard-mobile.html';
    } else if (!isMobile && currentPage.includes('dashboard-mobile.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Show version switcher
function showVersionSwitcher() {
    const isMobile = isMobileDevice();
    const currentVersion = window.location.pathname.includes('mobile') ? 'mobile' : 'desktop';

    return {
        currentVersion,
        isMobile,
        canSwitch: true
    };
}

// Switch version manually
function switchVersion(targetVersion) {
    setUserVersionPreference(targetVersion);

    if (targetVersion === 'mobile') {
        window.location.href = 'dashboard-mobile.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    // Don't auto-route on first visit to let user see landing page
    const hasVisited = localStorage.getItem('mysafety_has_visited');

    if (hasVisited && !window.location.pathname.includes('index.html')) {
        routeToVersion();
    } else {
        localStorage.setItem('mysafety_has_visited', 'true');
    }
}

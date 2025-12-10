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
    const path = window.location.pathname;
    const preference = getUserVersionPreference();
    const isMobile = isMobileDevice();

    // 1. Don't touch Auth or Index pages
    if (path.includes('auth.html') || path.includes('index.html') || path === '/' || path === '') {
        return;
    }

    const onMobilePage = path.includes('dashboard-mobile.html');
    const onDesktopPage = path.includes('dashboard.html');

    // 2. STRICT PREFERENCE CHECK (Overrides everything)
    if (preference === 'mobile') {
        if (onDesktopPage) {
            window.location.href = 'dashboard-mobile.html';
        }
        return; // If on mobile page, STAY THERE.
    }

    if (preference === 'desktop') {
        if (onMobilePage) {
            window.location.href = 'dashboard.html';
        }
        return; // If on desktop page, STAY THERE.
    }

    // 3. AUTO-DETECTION (Only if NO preference is set)
    if (!preference) {
        if (isMobile && onDesktopPage) {
            window.location.href = 'dashboard-mobile.html';
        } else if (!isMobile && onMobilePage) {
            // Optional: Auto-redirect desktop users back to desktop view
            // But only if they haven't explicitly chosen mobile
            window.location.href = 'dashboard.html';
        }
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

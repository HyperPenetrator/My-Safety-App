// ===================================
// OFFLINE DETECTION & INDICATOR
// ===================================

(function () {
    'use strict';

    // Create offline banner
    function createOfflineBanner() {
        const banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.className = 'offline-banner';
        banner.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            <span>You're offline - Using cached data</span>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
        return banner;
    }

    // Initialize
    let offlineBanner = null;

    function updateOnlineStatus() {
        const isOnline = navigator.onLine;

        if (!isOnline) {
            // Show offline banner
            if (!offlineBanner) {
                offlineBanner = createOfflineBanner();
            }
            setTimeout(() => {
                offlineBanner.classList.add('show');
                document.body.classList.add('offline-mode');
            }, 100);

            console.warn('⚠️ Device is OFFLINE');
        } else {
            // Hide offline banner
            if (offlineBanner) {
                offlineBanner.classList.remove('show');
                document.body.classList.remove('offline-mode');
            }

            console.log('✅ Device is ONLINE');
        }
    }

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check initial status
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateOnlineStatus);
    } else {
        updateOnlineStatus();
    }
})();

// ===================================
// LOCATION TRACKING & MONITORING
// My Safety App - Advanced Location Features
// ===================================

// Global variables for location tracking
let locationTracking = {
    enabled: false,
    watchId: null,
    defaultLocation: null,
    currentLocation: null,
    lastNotificationTime: null,
    notificationInterval: 30 * 60 * 1000, // 30 minutes in milliseconds
    distanceThreshold: 2, // 2 km
    trackingStartTime: null
};

// Notification permission status
let notificationPermission = false;

// ===================================
// INITIALIZATION
// ===================================

function initializeLocationTracking() {
    // Check if geolocation is supported
    if (!('geolocation' in navigator)) {
        console.error('Geolocation is not supported');
        return false;
    }

    // Request notification permission
    requestNotificationPermission();

    // Load saved settings
    loadLocationTrackingSettings();

    console.log('Location tracking initialized');
    return true;
}

// ===================================
// NOTIFICATION PERMISSION
// ===================================

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    try {
        if (Notification.permission === 'granted') {
            notificationPermission = true;
            console.log('Notification permission already granted');
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            notificationPermission = permission === 'granted';

            if (notificationPermission) {
                console.log('Notification permission granted');
                showToast('Notifications enabled for safety alerts', 'success');

                // Show test notification
                showNotification(
                    'My Safety Notifications Enabled',
                    'You will receive safety alerts when you travel 2km from your default location',
                    'info'
                );
            } else {
                console.log('Notification permission denied');
                showToast('Please enable notifications for safety alerts', 'error');
            }

            return notificationPermission;
        }

        return false;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
}

// ===================================
// DEFAULT LOCATION MANAGEMENT
// ===================================

async function setDefaultLocation(latitude, longitude, name = 'Default Location') {
    try {
        locationTracking.defaultLocation = {
            latitude,
            longitude,
            name,
            setAt: new Date().toISOString()
        };

        // Save to Firestore
        await saveLocationSettings();

        // Update UI
        updateDefaultLocationUI();

        showToast(`Default location set: ${name}`, 'success');
        console.log('Default location set:', locationTracking.defaultLocation);

        return true;
    } catch (error) {
        console.error('Error setting default location:', error);
        showToast('Error setting default location', 'error');
        return false;
    }
}

async function setCurrentLocationAsDefault() {
    if (!locationTracking.currentLocation) {
        showToast('Please enable location access first', 'error');
        return false;
    }

    try {
        // Get address for the current location
        const address = await getAddressFromCoordinates(
            locationTracking.currentLocation.latitude,
            locationTracking.currentLocation.longitude
        );

        await setDefaultLocation(
            locationTracking.currentLocation.latitude,
            locationTracking.currentLocation.longitude,
            address || 'Current Location'
        );

        return true;
    } catch (error) {
        console.error('Error setting current location as default:', error);
        return false;
    }
}

async function clearDefaultLocation() {
    locationTracking.defaultLocation = null;
    await saveLocationSettings();
    updateDefaultLocationUI();
    showToast('Default location cleared', 'info');
}

// ===================================
// LOCATION TRACKING
// ===================================

function startLocationTracking() {
    if (!('geolocation' in navigator)) {
        showToast('Geolocation is not supported by your browser', 'error');
        return false;
    }

    if (locationTracking.enabled) {
        console.log('Location tracking already enabled');
        return true;
    }

    try {
        // Start watching position
        locationTracking.watchId = navigator.geolocation.watchPosition(
            handleLocationUpdate,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        locationTracking.enabled = true;
        locationTracking.trackingStartTime = new Date();

        console.log('Location tracking started');
        showToast('Location tracking activated', 'success');

        // Update UI
        updateLocationTrackingUI();

        // Save settings
        saveLocationSettings();

        return true;
    } catch (error) {
        console.error('Error starting location tracking:', error);
        showToast('Error starting location tracking', 'error');
        return false;
    }
}

function stopLocationTracking() {
    if (!locationTracking.enabled) {
        return;
    }

    if (locationTracking.watchId) {
        navigator.geolocation.clearWatch(locationTracking.watchId);
        locationTracking.watchId = null;
    }

    locationTracking.enabled = false;

    console.log('Location tracking stopped');
    showToast('Location tracking deactivated', 'info');

    // Update UI
    updateLocationTrackingUI();

    // Save settings
    saveLocationSettings();
}

function handleLocationUpdate(position) {
    const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp)
    };

    console.log('Location updated:', newLocation);

    // Store previous location
    const previousLocation = locationTracking.currentLocation;

    // Update current location
    locationTracking.currentLocation = newLocation;

    // Check if we need to send notification
    if (locationTracking.defaultLocation) {
        checkLocationChange(newLocation, previousLocation);
    }

    // Update UI
    updateCurrentLocationUI(newLocation);

    // Save to Firestore periodically (every 5 minutes)
    const now = Date.now();
    if (!locationTracking.lastSaveTime || (now - locationTracking.lastSaveTime) > 5 * 60 * 1000) {
        saveCurrentLocation(newLocation);
        locationTracking.lastSaveTime = now;
    }
}

function handleLocationError(error) {
    console.error('Location error:', error);

    let message = 'Error getting location';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out';
            break;
    }

    showToast(message, 'error');
}

// ===================================
// DISTANCE CALCULATION & CHECKING
// ===================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Returns distance in kilometers
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function checkLocationChange(newLocation, previousLocation) {
    if (!locationTracking.defaultLocation) {
        return;
    }

    // Calculate distance from default location
    const distanceFromDefault = calculateDistance(
        locationTracking.defaultLocation.latitude,
        locationTracking.defaultLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
    );

    console.log(`Distance from default location: ${distanceFromDefault.toFixed(2)} km`);

    // Check if distance exceeds threshold (2 km)
    if (distanceFromDefault >= locationTracking.distanceThreshold) {
        handleDistanceThresholdExceeded(distanceFromDefault);
    } else {
        // User is within safe range
        if (locationTracking.lastNotificationTime) {
            console.log('User returned to safe range');
            // Reset notification timer when user returns
            locationTracking.lastNotificationTime = null;
        }
    }
}

function handleDistanceThresholdExceeded(distance) {
    const now = Date.now();

    // Check if we should send notification (30-minute interval)
    const shouldNotify = !locationTracking.lastNotificationTime ||
        (now - locationTracking.lastNotificationTime) >= locationTracking.notificationInterval;

    if (shouldNotify) {
        sendSafetyNotification(distance);
        locationTracking.lastNotificationTime = now;

        // Save notification time
        saveLocationSettings();
    } else {
        // Calculate time until next notification
        const timeSinceLastNotification = now - locationTracking.lastNotificationTime;
        const timeUntilNext = locationTracking.notificationInterval - timeSinceLastNotification;
        const minutesUntilNext = Math.ceil(timeUntilNext / (60 * 1000));

        console.log(`Next notification in ${minutesUntilNext} minutes`);
    }
}

// ===================================
// NOTIFICATIONS
// ===================================

function sendSafetyNotification(distance) {
    const title = '🚨 My Safety Alert';
    const message = `You've traveled ${distance.toFixed(1)}km from your default location. Please activate Safety Mode for your protection.`;

    // Show browser notification
    showNotification(title, message, 'warning');

    // Show in-app notification
    showToast(message, 'warning');

    // Log to console
    console.log('Safety notification sent:', message);

    // Save notification to history
    saveNotificationToHistory({
        type: 'distance_alert',
        distance: distance.toFixed(2),
        timestamp: new Date().toISOString(),
        message: message
    });

    // Show modal with action buttons
    showSafetyAlertModal(distance);
}

function showNotification(title, message, type = 'info') {
    if (!notificationPermission || Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
    }

    try {
        const icon = getNotificationIcon(type);
        const notification = new Notification(title, {
            body: message,
            icon: icon,
            badge: icon,
            tag: 'safety-alert',
            requireInteraction: true, // Notification stays until user interacts
            vibrate: [200, 100, 200], // Vibration pattern
            data: {
                type: type,
                timestamp: new Date().toISOString()
            }
        });

        notification.onclick = function () {
            window.focus();
            // Navigate to safety mode section
            if (typeof navigateToSection === 'function') {
                navigateToSection('safety');
            }
            notification.close();
        };

        // Auto-close after 10 seconds for info notifications
        if (type === 'info') {
            setTimeout(() => notification.close(), 10000);
        }

    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

function getNotificationIcon(type) {
    // Return appropriate icon based on notification type
    // In production, use actual icon URLs
    const icons = {
        info: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%234facfe"/></svg>',
        warning: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23f093fb"/></svg>',
        error: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23f5576c"/></svg>',
        success: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%2343e97b"/></svg>'
    };

    return icons[type] || icons.info;
}

function showSafetyAlertModal(distance) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('locationAlertModal');

    if (!modal) {
        modal = createLocationAlertModal();
        document.body.appendChild(modal);
    }

    // Update modal content
    const distanceText = modal.querySelector('#alertDistance');
    const locationText = modal.querySelector('#alertLocation');

    if (distanceText) {
        distanceText.textContent = `${distance.toFixed(1)} km`;
    }

    if (locationText && locationTracking.defaultLocation) {
        locationText.textContent = locationTracking.defaultLocation.name;
    }

    // Show modal
    modal.classList.remove('hidden');

    // Setup button handlers
    setupAlertModalButtons(modal);
}

function createLocationAlertModal() {
    const modal = document.createElement('div');
    modal.id = 'locationAlertModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content location-alert">
            <div class="modal-header warning">
                <h2>🚨 Location Alert</h2>
            </div>
            <div class="modal-body">
                <div class="alert-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-width="2"/>
                        <circle cx="12" cy="10" r="3" stroke-width="2"/>
                    </svg>
                </div>
                <h3>You've Traveled Far From Your Default Location</h3>
                <div class="alert-details">
                    <p><strong>Distance:</strong> <span id="alertDistance">-</span></p>
                    <p><strong>Default Location:</strong> <span id="alertLocation">-</span></p>
                    <p class="alert-message">For your safety, we recommend activating Safety Mode while traveling.</p>
                </div>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn" id="dismissAlertBtn">Dismiss</button>
                <button class="confirm-btn" id="activateSafetyFromAlertBtn">Activate Safety Mode</button>
            </div>
        </div>
    `;

    return modal;
}

function setupAlertModalButtons(modal) {
    const dismissBtn = modal.querySelector('#dismissAlertBtn');
    const activateBtn = modal.querySelector('#activateSafetyFromAlertBtn');

    if (dismissBtn) {
        dismissBtn.onclick = () => {
            modal.classList.add('hidden');
        };
    }

    if (activateBtn) {
        activateBtn.onclick = () => {
            modal.classList.add('hidden');

            // Navigate to safety section
            if (typeof navigateToSection === 'function') {
                navigateToSection('safety');
            }

            // Auto-activate safety mode
            const safetyToggle = document.getElementById('safetyModeToggle');
            if (safetyToggle && !safetyToggle.checked) {
                safetyToggle.checked = true;
                safetyToggle.dispatchEvent(new Event('change'));
            }

            showToast('Safety Mode activated', 'success');
        };
    }
}

// ===================================
// DATA PERSISTENCE
// ===================================

async function saveLocationSettings() {
    if (!currentUser || !db) return;

    try {
        const settings = {
            defaultLocation: locationTracking.defaultLocation,
            trackingEnabled: locationTracking.enabled,
            distanceThreshold: locationTracking.distanceThreshold,
            notificationInterval: locationTracking.notificationInterval,
            lastNotificationTime: locationTracking.lastNotificationTime,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(currentUser.uid).update({
            locationTracking: settings
        });

        console.log('Location settings saved');
    } catch (error) {
        console.error('Error saving location settings:', error);
    }
}

async function loadLocationTrackingSettings() {
    if (!currentUser || !db) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            if (userData.locationTracking) {
                const settings = userData.locationTracking;

                locationTracking.defaultLocation = settings.defaultLocation || null;
                locationTracking.distanceThreshold = settings.distanceThreshold || 2;
                locationTracking.notificationInterval = settings.notificationInterval || (30 * 60 * 1000);
                locationTracking.lastNotificationTime = settings.lastNotificationTime || null;

                // Update UI
                updateDefaultLocationUI();

                // Restart tracking if it was enabled
                if (settings.trackingEnabled) {
                    startLocationTracking();
                }

                console.log('Location tracking settings loaded');
            }
        }
    } catch (error) {
        console.error('Error loading location tracking settings:', error);
    }
}

async function saveCurrentLocation(location) {
    if (!currentUser || !db) return;

    try {
        await db.collection('users').doc(currentUser.uid).update({
            currentLocation: {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }
        });
    } catch (error) {
        console.error('Error saving current location:', error);
    }
}

async function saveNotificationToHistory(notification) {
    if (!currentUser || !db) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('notificationHistory')
            .add(notification);
    } catch (error) {
        console.error('Error saving notification to history:', error);
    }
}

// ===================================
// UI UPDATES
// ===================================

function updateDefaultLocationUI() {
    const defaultLocationDisplay = document.getElementById('defaultLocationDisplay');
    const defaultLocationName = document.getElementById('defaultLocationName');
    const defaultLocationCoords = document.getElementById('defaultLocationCoords');
    const clearDefaultBtn = document.getElementById('clearDefaultLocationBtn');

    if (locationTracking.defaultLocation) {
        if (defaultLocationDisplay) {
            defaultLocationDisplay.classList.remove('hidden');
        }

        if (defaultLocationName) {
            defaultLocationName.textContent = locationTracking.defaultLocation.name;
        }

        if (defaultLocationCoords) {
            defaultLocationCoords.textContent =
                `${locationTracking.defaultLocation.latitude.toFixed(6)}, ${locationTracking.defaultLocation.longitude.toFixed(6)}`;
        }

        if (clearDefaultBtn) {
            clearDefaultBtn.classList.remove('hidden');
        }
    } else {
        if (defaultLocationDisplay) {
            defaultLocationDisplay.classList.add('hidden');
        }

        if (clearDefaultBtn) {
            clearDefaultBtn.classList.add('hidden');
        }
    }
}

function updateCurrentLocationUI(location) {
    const currentLocationDisplay = document.getElementById('currentLocationDisplay');
    const currentLocationCoords = document.getElementById('currentLocationCoords');
    const locationAccuracy = document.getElementById('locationAccuracy');

    if (currentLocationDisplay) {
        currentLocationDisplay.classList.remove('hidden');
    }

    if (currentLocationCoords) {
        currentLocationCoords.textContent =
            `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    }

    if (locationAccuracy) {
        locationAccuracy.textContent = `±${location.accuracy.toFixed(0)}m`;
    }

    // Update distance from default if set
    if (locationTracking.defaultLocation) {
        const distance = calculateDistance(
            locationTracking.defaultLocation.latitude,
            locationTracking.defaultLocation.longitude,
            location.latitude,
            location.longitude
        );

        const distanceDisplay = document.getElementById('distanceFromDefault');
        if (distanceDisplay) {
            distanceDisplay.textContent = `${distance.toFixed(2)} km`;

            // Color code based on threshold
            if (distance >= locationTracking.distanceThreshold) {
                distanceDisplay.style.color = '#f5576c';
            } else {
                distanceDisplay.style.color = '#43e97b';
            }
        }
    }
}

function updateLocationTrackingUI() {
    const trackingStatus = document.getElementById('locationTrackingStatus');
    const trackingToggle = document.getElementById('locationTrackingToggle');

    if (trackingStatus) {
        trackingStatus.textContent = locationTracking.enabled ? 'Active' : 'Inactive';
        trackingStatus.style.color = locationTracking.enabled ? '#43e97b' : 'var(--text-secondary)';
    }

    if (trackingToggle) {
        trackingToggle.checked = locationTracking.enabled;
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

async function getAddressFromCoordinates(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();

        if (data && data.display_name) {
            return data.display_name;
        }
        return null;
    } catch (error) {
        console.error('Error getting address:', error);
        return null;
    }
}

// ===================================
// EXPORT FUNCTIONS
// ===================================

// Make functions globally available
window.initializeLocationTracking = initializeLocationTracking;
window.requestNotificationPermission = requestNotificationPermission;
window.setDefaultLocation = setDefaultLocation;
window.setCurrentLocationAsDefault = setCurrentLocationAsDefault;
window.clearDefaultLocation = clearDefaultLocation;
window.startLocationTracking = startLocationTracking;
window.stopLocationTracking = stopLocationTracking;

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLocationTracking);
} else {
    initializeLocationTracking();
}

console.log('Location tracking module loaded');

// ===================================
// PERMISSION MANAGEMENT SYSTEM
// ===================================

class PermissionManager {
    constructor() {
        this.permissions = {
            location: { granted: false, status: 'pending' },
            microphone: { granted: false, status: 'pending' },
            notifications: { granted: false, status: 'pending' },
            camera: { granted: false, status: 'pending' }
        };

        this.init();
    }

    async init() {
        // Check existing permissions on load
        await this.checkAllPermissions();
        this.updateUI();
        this.attachEventListeners();
    }

    // Check all permissions status
    async checkAllPermissions() {
        await this.checkLocationPermission();
        await this.checkMicrophonePermission();
        await this.checkNotificationPermission();
        await this.checkCameraPermission();
    }

    // Location Permission
    async checkLocationPermission() {
        if ('geolocation' in navigator) {
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                this.permissions.location.status = result.state;
                this.permissions.location.granted = result.state === 'granted';

                // Listen for permission changes
                result.addEventListener('change', () => {
                    this.permissions.location.status = result.state;
                    this.permissions.location.granted = result.state === 'granted';
                    this.updatePermissionUI('location');
                });
            } catch (error) {
                console.log('Permission API not supported, will check on request');
            }
        }
    }

    async requestLocationPermission() {
        return new Promise((resolve, reject) => {
            if (!('geolocation' in navigator)) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.permissions.location.granted = true;
                    this.permissions.location.status = 'granted';
                    this.updatePermissionUI('location');
                    this.showToast('✅ Location access granted', 'success');
                    resolve(position);
                },
                (error) => {
                    this.permissions.location.granted = false;
                    this.permissions.location.status = 'denied';
                    this.updatePermissionUI('location');
                    this.showToast('❌ Location access denied', 'error');
                    reject(error);
                },
                { enableHighAccuracy: true }
            );
        });
    }

    // Microphone Permission
    async checkMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            this.permissions.microphone.status = result.state;
            this.permissions.microphone.granted = result.state === 'granted';

            result.addEventListener('change', () => {
                this.permissions.microphone.status = result.state;
                this.permissions.microphone.granted = result.state === 'granted';
                this.updatePermissionUI('microphone');
            });
        } catch (error) {
            console.log('Microphone permission check not supported');
        }
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Permission granted
            this.permissions.microphone.granted = true;
            this.permissions.microphone.status = 'granted';
            this.updatePermissionUI('microphone');
            this.showToast('✅ Microphone access granted', 'success');

            // Stop the stream (we just needed permission)
            stream.getTracks().forEach(track => track.stop());

            return true;
        } catch (error) {
            this.permissions.microphone.granted = false;
            this.permissions.microphone.status = 'denied';
            this.updatePermissionUI('microphone');
            this.showToast('❌ Microphone access denied', 'error');
            return false;
        }
    }

    // Notification Permission
    async checkNotificationPermission() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            this.permissions.notifications.status = permission;
            this.permissions.notifications.granted = permission === 'granted';
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            this.showToast('❌ Notifications not supported', 'error');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permissions.notifications.status = permission;
            this.permissions.notifications.granted = permission === 'granted';
            this.updatePermissionUI('notifications');

            if (permission === 'granted') {
                this.showToast('✅ Notification access granted', 'success');

                // Show test notification
                new Notification('My Safety', {
                    body: 'Notifications enabled successfully!',
                    icon: '🛡️',
                    badge: '🛡️'
                });
            } else {
                this.showToast('❌ Notification access denied', 'error');
            }

            return permission === 'granted';
        } catch (error) {
            this.showToast('❌ Error requesting notifications', 'error');
            return false;
        }
    }

    // Camera Permission
    async checkCameraPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            this.permissions.camera.status = result.state;
            this.permissions.camera.granted = result.state === 'granted';

            result.addEventListener('change', () => {
                this.permissions.camera.status = result.state;
                this.permissions.camera.granted = result.state === 'granted';
                this.updatePermissionUI('camera');
            });
        } catch (error) {
            console.log('Camera permission check not supported');
        }
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            this.permissions.camera.granted = true;
            this.permissions.camera.status = 'granted';
            this.updatePermissionUI('camera');
            this.showToast('✅ Camera access granted', 'success');

            // Stop the stream
            stream.getTracks().forEach(track => track.stop());

            return true;
        } catch (error) {
            this.permissions.camera.granted = false;
            this.permissions.camera.status = 'denied';
            this.updatePermissionUI('camera');
            this.showToast('❌ Camera access denied', 'error');
            return false;
        }
    }

    // Request all critical permissions
    async requestAllPermissions() {
        const results = {
            location: false,
            microphone: false,
            notifications: false
        };

        // Request in sequence with delays
        try {
            results.location = await this.requestLocationPermission();
            await this.delay(500);

            results.microphone = await this.requestMicrophonePermission();
            await this.delay(500);

            results.notifications = await this.requestNotificationPermission();
        } catch (error) {
            console.error('Error requesting permissions:', error);
        }

        // Update overview
        this.updateOverviewStats();

        return results;
    }

    // Update UI for specific permission
    updatePermissionUI(permissionType) {
        const permission = this.permissions[permissionType];
        const card = document.getElementById(`${permissionType}PermCard`);
        const statusBadge = document.getElementById(`${permissionType}PermStatus`);
        const button = document.getElementById(`request${this.capitalize(permissionType)}Btn`);

        if (!card || !statusBadge || !button) return;

        // Update status badge
        statusBadge.innerHTML = this.getStatusBadge(permission.status);

        // Update button
        if (permission.granted) {
            button.textContent = '✓ Access Granted';
            button.classList.add('granted');
            button.disabled = true;
            card.classList.add('granted');
        } else if (permission.status === 'denied') {
            button.textContent = '⚠️ Access Denied - Check Settings';
            button.classList.add('denied');
            button.disabled = true;
            card.classList.add('denied');
        } else {
            button.textContent = `Grant ${this.capitalize(permissionType)} Access`;
            button.classList.remove('granted', 'denied');
            button.disabled = false;
            card.classList.remove('granted', 'denied');
        }
    }

    // Update all permission UIs
    updateUI() {
        Object.keys(this.permissions).forEach(type => {
            this.updatePermissionUI(type);
        });
        this.updateOverviewStats();
    }

    // Update overview statistics
    updateOverviewStats() {
        const locationStatus = document.getElementById('locationStatus');
        const microphoneStatus = document.getElementById('microphoneStatus');

        if (locationStatus) {
            locationStatus.textContent = this.permissions.location.granted ? 'Granted ✓' : 'Not Set';
            locationStatus.style.color = this.permissions.location.granted ? '#4CAF50' : '#ff9800';
        }

        if (microphoneStatus) {
            microphoneStatus.textContent = this.permissions.microphone.granted ? 'Granted ✓' : 'Not Set';
            microphoneStatus.style.color = this.permissions.microphone.granted ? '#4CAF50' : '#ff9800';
        }
    }

    // Get status badge HTML
    getStatusBadge(status) {
        const badges = {
            'granted': '<span class="status-badge granted">✓ Granted</span>',
            'denied': '<span class="status-badge denied">✗ Denied</span>',
            'prompt': '<span class="status-badge pending">⏳ Pending</span>',
            'pending': '<span class="status-badge pending">⏳ Pending</span>'
        };
        return badges[status] || badges.pending;
    }

    // Attach event listeners to permission buttons
    attachEventListeners() {
        // Location
        const locationBtn = document.getElementById('requestLocationBtn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.requestLocationPermission());
        }

        // Microphone
        const microphoneBtn = document.getElementById('requestMicrophoneBtn');
        if (microphoneBtn) {
            microphoneBtn.addEventListener('click', () => this.requestMicrophonePermission());
        }

        // Notifications
        const notificationsBtn = document.getElementById('requestNotificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.requestNotificationPermission());
        }

        // Camera
        const cameraBtn = document.getElementById('requestCameraBtn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => this.requestCameraPermission());
        }

        // Setup All Permissions button
        const setupAllBtn = document.getElementById('setupPermissionsBtn');
        if (setupAllBtn) {
            setupAllBtn.addEventListener('click', () => this.requestAllPermissions());
        }
    }

    // Helper functions
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showToast(message, type) {
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(message);
        }
    }

    // Get permission summary
    getPermissionSummary() {
        const granted = Object.values(this.permissions).filter(p => p.granted).length;
        const total = Object.keys(this.permissions).length;
        return { granted, total };
    }
}

// Initialize permission manager
let permissionManager;

window.addEventListener('DOMContentLoaded', () => {
    permissionManager = new PermissionManager();
});

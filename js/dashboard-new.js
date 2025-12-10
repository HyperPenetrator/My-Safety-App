// ===================================
// DASHBOARD LOGIC - SAFETY APP
// ===================================

// Global variables
let auth, db, currentUser;
let userLocation = null;
let permissionsGranted = {
    location: false,
    microphone: false,
    contacts: false
};

// Emergency services data
let emergencyServices = {
    police: null,
    helpline: null
};

// User contacts
let emergencyContacts = [];
let authorityContacts = {
    college: null,
    hostel: null
};

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        auth = firebase.auth();
        db = firebase.firestore();

        // Check auth state
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                initializeDashboard();
            } else {
                // Redirect to auth page if not logged in
                window.location.href = 'auth.html';
            }
        });
    } else {
        console.error('Firebase not initialized');
        showToast('Configuration error. Please check Firebase setup.', 'error');
    }
});

async function initializeDashboard() {
    try {
        // Load user data
        await loadUserData();

        // Setup navigation
        setupNavigation();

        // Setup event listeners
        setupEventListeners();

        // Load saved data
        await loadSavedData();

        // Update UI
        updateDashboardStats();

        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('Error loading dashboard', 'error');
    }
}

// ===================================
// USER DATA
// ===================================

async function loadUserData() {
    try {
        // Update user info in navbar
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userStatus = document.getElementById('userStatus');

        if (currentUser.photoURL) {
            userAvatar.src = currentUser.photoURL;
        } else {
            // Create initials avatar
            const initials = currentUser.displayName ?
                currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase() :
                currentUser.email[0].toUpperCase();
            userAvatar.src = `https://ui-avatars.com/api/?name=${initials}&background=667eea&color=fff&size=128`;
        }

        userName.textContent = currentUser.displayName || currentUser.email;
        userStatus.textContent = 'Active';

    } catch (error) {
        console.error('Error loading user data:', error);
    }

    // Populate Profile Section
    if (currentUser) {
        // Headers
        const pName = document.getElementById('profileNameDisplay');
        const pEmail = document.getElementById('profileEmailDisplay');
        if (pName) pName.textContent = currentUser.displayName || 'No Name Set';
        if (pEmail) pEmail.textContent = currentUser.email;

        // Inputs
        const iName = document.getElementById('profileNameInput');
        const iPhone = document.getElementById('profilePhoneInput');

        if (iName) iName.value = currentUser.displayName || '';

        // Load Phone from DB if available (since auth doesn't always have it)
        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists && doc.data().phone) {
                if (iPhone) iPhone.value = doc.data().phone;
            }
        } catch (e) { console.log('Err loading phone', e); }
    }
}

// Profile Save Listener
const saveProfileBtn = document.getElementById('saveProfileBtn');
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = 'Updating...';

        const newName = document.getElementById('profileNameInput').value;
        const newPhone = document.getElementById('profilePhoneInput').value;

        try {
            await currentUser.updateProfile({ displayName: newName });
            await db.collection('users').doc(currentUser.uid).update({
                name: newName,
                phone: newPhone,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // Merge to avoid overwriting other fields

            showToast('Profile Updated Successfully', 'success');
            // Refresh display
            document.getElementById('userName').textContent = newName;
            document.getElementById('profileNameDisplay').textContent = newName;
        } catch (error) {
            console.error('Profile update failed:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = 'Update Profile';
        }
    });
}

async function loadSavedData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            // Load emergency contacts
            if (userData.emergencyContacts) {
                emergencyContacts = userData.emergencyContacts;
                renderEmergencyContacts();
            }

            // Load authority contacts
            if (userData.authorityContacts) {
                authorityContacts = userData.authorityContacts;
                renderAuthorityContacts();
            }

            // Load emergency services
            if (userData.emergencyServices) {
                emergencyServices = userData.emergencyServices;
                renderEmergencyServices();
            }

            // Load safety settings
            if (userData.safetyMode) {
                applySafetySettings(userData.safetyMode);
            }
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// ===================================
// NAVIGATION
// ===================================

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const targetSection = item.dataset.section;

            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });

    // Logout buttons
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('sidebarLogoutBtn')?.addEventListener('click', handleLogout);
}

async function handleLogout() {
    try {
        await auth.signOut();
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showToast('Error signing out', 'error');
    }
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Quick action buttons
    document.getElementById('setupPermissionsBtn')?.addEventListener('click', () => {
        navigateToSection('permissions');
    });

    document.getElementById('addContactBtn')?.addEventListener('click', () => {
        navigateToSection('contacts');
    });

    document.getElementById('activateSafetyBtn')?.addEventListener('click', () => {
        navigateToSection('safety');
    });

    // Permission buttons
    document.getElementById('requestLocationBtn')?.addEventListener('click', requestLocationPermission);
    document.getElementById('requestMicrophoneBtn')?.addEventListener('click', requestMicrophonePermission);
    document.getElementById('requestContactsBtn')?.addEventListener('click', requestContactsPermission);

    // Contact form
    document.getElementById('addContactForm')?.addEventListener('submit', handleAddContact);

    // Authority forms
    document.getElementById('collegeAuthorityForm')?.addEventListener('submit', handleSaveCollegeAuthority);
    document.getElementById('hostelAuthorityForm')?.addEventListener('submit', handleSaveHostelAuthority);

    // Edit authority buttons
    document.getElementById('editCollegeBtn')?.addEventListener('click', () => editAuthority('college'));
    document.getElementById('editHostelBtn')?.addEventListener('click', () => editAuthority('hostel'));

    // Safety mode toggles
    document.getElementById('safetyModeToggle')?.addEventListener('change', handleSafetyModeToggle);
    document.getElementById('voiceCommandToggle')?.addEventListener('change', handleVoiceCommandToggle);
    document.getElementById('screamDetectionToggle')?.addEventListener('change', handleScreamDetectionToggle);
    document.getElementById('locationSharingToggle')?.addEventListener('change', handleLocationSharingToggle);
    document.getElementById('batteryAlertsToggle')?.addEventListener('change', handleBatteryAlertsToggle);

    // Voice language selector
    document.getElementById('voiceLanguageSelect')?.addEventListener('change', (e) => {
        if (typeof changeVoiceLanguage === 'function') {
            changeVoiceLanguage(e.target.value);
        }
    });
}

function navigateToSection(sectionId) {
    const menuItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (menuItem) {
        menuItem.click();
    }
}

// ===================================
// PERMISSIONS HANDLING
// ===================================

async function requestLocationPermission() {
    const btn = document.getElementById('requestLocationBtn');
    const statusBadge = document.querySelector('#locationPermStatus .status-badge');
    const locationInfo = document.getElementById('locationInfo');

    btn.disabled = true;
    btn.textContent = 'Requesting...';

    try {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Permission granted
                    permissionsGranted.location = true;
                    userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    // Update UI
                    statusBadge.textContent = 'Granted';
                    statusBadge.className = 'status-badge granted';
                    btn.textContent = '✓ Location Enabled';
                    btn.disabled = true;

                    // Show location info
                    locationInfo.classList.remove('hidden');
                    document.getElementById('coordinates').textContent =
                        `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;

                    // Get address from coordinates
                    await getAddressFromCoordinates(userLocation.latitude, userLocation.longitude);

                    // Detect emergency services
                    await detectEmergencyServices(userLocation);

                    // Update stats
                    document.getElementById('locationStatus').textContent = 'Enabled';
                    updateDashboardStats();

                    showToast('Location access granted successfully', 'success');
                },
                (error) => {
                    // Permission denied
                    permissionsGranted.location = false;
                    statusBadge.textContent = 'Denied';
                    statusBadge.className = 'status-badge denied';
                    btn.textContent = 'Grant Location Access';
                    btn.disabled = false;

                    showToast('Location access denied. Please enable in browser settings.', 'error');
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            showToast('Geolocation is not supported by your browser', 'error');
            btn.disabled = false;
            btn.textContent = 'Not Supported';
        }
    } catch (error) {
        console.error('Error requesting location:', error);
        btn.disabled = false;
        btn.textContent = 'Grant Location Access';
        showToast('Error requesting location permission', 'error');
    }
}

async function getAddressFromCoordinates(lat, lng) {
    try {
        // Using OpenStreetMap Nominatim API for reverse geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();

        if (data && data.display_name) {
            document.getElementById('currentLocation').textContent = data.display_name;
        }
    } catch (error) {
        console.error('Error getting address:', error);
        document.getElementById('currentLocation').textContent = 'Address lookup failed';
    }
}

async function requestMicrophonePermission() {
    const btn = document.getElementById('requestMicrophoneBtn');
    const statusBadge = document.querySelector('#microphonePermStatus .status-badge');

    btn.disabled = true;
    btn.textContent = 'Requesting...';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Permission granted
        permissionsGranted.microphone = true;

        // Stop the stream (we just needed permission)
        stream.getTracks().forEach(track => track.stop());

        // Update UI
        statusBadge.textContent = 'Granted';
        statusBadge.className = 'status-badge granted';
        btn.textContent = '✓ Microphone Enabled';
        btn.disabled = true;

        // Update stats
        document.getElementById('microphoneStatus').textContent = 'Enabled';
        updateDashboardStats();

        showToast('Microphone access granted successfully', 'success');
    } catch (error) {
        // Permission denied
        permissionsGranted.microphone = false;
        statusBadge.textContent = 'Denied';
        statusBadge.className = 'status-badge denied';
        btn.textContent = 'Grant Microphone Access';
        btn.disabled = false;

        showToast('Microphone access denied. Please enable in browser settings.', 'error');
        console.error('Microphone error:', error);
    }
}

async function requestContactsPermission() {
    const btn = document.getElementById('requestContactsBtn');
    const statusBadge = document.querySelector('#contactsPermStatus .status-badge');

    btn.disabled = true;
    btn.textContent = 'Importing...';

    if (contactsManager.isSupported()) {
        const result = await contactsManager.selectContacts();

        if (result.success) {
            // Add imported contacts
            for (const contact of result.contacts) {
                if (emergencyContacts.length >= 5) break;

                emergencyContacts.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: contact.name,
                    phone: contact.phone,
                    relation: 'Imported',
                    email: '',
                    addedAt: new Date().toISOString()
                });
            }

            await saveEmergencyContacts();
            renderEmergencyContacts();

            showToast(`Successfully imported ${result.contacts.length} contacts`, 'success');

            statusBadge.textContent = 'Granted';
            statusBadge.className = 'status-badge granted';
            btn.textContent = 'Import More';
        } else {
            if (result.error !== 'cancelled') {
                showToast('Error importing contacts: ' + result.error, 'error');
            }
            btn.textContent = 'Import Contacts';
        }
    } else {
        showToast('Contact Import is not supported on this device. Please add manually.', 'info');
        statusBadge.textContent = 'Manual Only';
        statusBadge.className = 'status-badge optional';
        btn.textContent = 'Not Supported';
    }

    btn.disabled = false;
}

// ===================================
// EMERGENCY SERVICES DETECTION
// ===================================

async function detectEmergencyServices(location) {
    try {
        showToast('Detecting nearby emergency services...', 'info');

        // Detect police station
        await detectPoliceStation(location);

        // Detect women's helpline
        await detectWomensHelpline(location);

        // Save to Firestore
        await saveEmergencyServices();

        showToast('Emergency services detected successfully', 'success');
    } catch (error) {
        console.error('Error detecting emergency services:', error);
        showToast('Error detecting emergency services', 'error');
    }
}

async function detectPoliceStation(location) {
    try {
        // Using Overpass API to find nearby police stations
        const query = `
            [out:json];
            (
                node["amenity"="police"](around:5000,${location.latitude},${location.longitude});
                way["amenity"="police"](around:5000,${location.latitude},${location.longitude});
            );
            out body;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        const data = await response.json();

        if (data.elements && data.elements.length > 0) {
            const station = data.elements[0];
            const distance = calculateDistance(
                location.latitude,
                location.longitude,
                station.lat || station.center.lat,
                station.lon || station.center.lon
            );

            emergencyServices.police = {
                name: station.tags?.name || 'Local Police Station',
                phone: station.tags?.phone || getDefaultPoliceNumber(location),
                address: station.tags?.['addr:full'] || 'Address not available',
                latitude: station.lat || station.center.lat,
                longitude: station.lon || station.center.lon,
                distance: distance.toFixed(2) + ' km'
            };
        } else {
            // Fallback to default numbers
            emergencyServices.police = {
                name: 'Police Emergency',
                phone: getDefaultPoliceNumber(location),
                address: 'Location-based service',
                distance: 'N/A'
            };
        }

        renderPoliceService();
    } catch (error) {
        console.error('Error detecting police station:', error);
        // Fallback
        emergencyServices.police = {
            name: 'Police Emergency',
            phone: '100', // Default India police number
            address: 'Emergency service',
            distance: 'N/A'
        };
        renderPoliceService();
    }
}

async function detectWomensHelpline(location) {
    try {
        // Women's helpline is typically a national/regional number
        // Using location to determine the appropriate helpline

        emergencyServices.helpline = {
            name: "Women's Helpline",
            phone: getWomensHelplineNumber(location),
            address: '24/7 National Service',
            hours: '24/7'
        };

        renderHelplineService();
    } catch (error) {
        console.error('Error detecting women\'s helpline:', error);
        emergencyServices.helpline = {
            name: "Women's Helpline",
            phone: '1091', // Default India women's helpline
            address: '24/7 National Service',
            hours: '24/7'
        };
        renderHelplineService();
    }
}

function getDefaultPoliceNumber(location) {
    // Based on country/region - defaulting to India
    // In production, use location to determine country
    return '100'; // India police
}

function getWomensHelplineNumber(location) {
    // Based on country/region - defaulting to India
    // In production, use location to determine country
    return '1091'; // India women's helpline
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function renderPoliceService() {
    if (!emergencyServices.police) return;

    const service = emergencyServices.police;

    document.getElementById('policeName').textContent = service.name;
    document.getElementById('policePhone').textContent = service.phone;
    document.getElementById('policeAddress').textContent = service.address;
    document.getElementById('policeDistance').textContent = service.distance;
    document.getElementById('policeLocation').textContent = 'Detected';

    const statusBadge = document.querySelector('#policeStatus .status-badge');
    statusBadge.textContent = 'Detected';
    statusBadge.className = 'status-badge granted';

    const callBtn = document.getElementById('callPoliceBtn');
    callBtn.disabled = false;
    callBtn.onclick = () => window.location.href = `tel:${service.phone}`;

    updateDashboardStats();
}

function renderHelplineService() {
    if (!emergencyServices.helpline) return;

    const service = emergencyServices.helpline;

    document.getElementById('helplineName').textContent = service.name;
    document.getElementById('helplinePhone').textContent = service.phone;
    document.getElementById('helplineAddress').textContent = service.address;
    document.getElementById('helplineHours').textContent = service.hours;
    document.getElementById('helplineLocation').textContent = 'Detected';

    const statusBadge = document.querySelector('#helplineStatus .status-badge');
    statusBadge.textContent = 'Detected';
    statusBadge.className = 'status-badge granted';

    const callBtn = document.getElementById('callHelplineBtn');
    callBtn.disabled = false;
    callBtn.onclick = () => window.location.href = `tel:${service.phone}`;

    updateDashboardStats();
}

function renderEmergencyServices() {
    if (emergencyServices.police) renderPoliceService();
    if (emergencyServices.helpline) renderHelplineService();
}

async function saveEmergencyServices() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            emergencyServices: emergencyServices,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving emergency services:', error);
    }
}

// ===================================
// EMERGENCY CONTACTS
// ===================================

async function handleAddContact(e) {
    e.preventDefault();

    if (emergencyContacts.length >= 5) {
        showToast('Maximum 5 emergency contacts allowed', 'error');
        return;
    }

    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const relation = document.getElementById('contactRelation').value;
    const email = document.getElementById('contactEmail').value.trim();

    const contact = {
        id: Date.now().toString(),
        name,
        phone,
        relation,
        email,
        addedAt: new Date().toISOString()
    };

    emergencyContacts.push(contact);

    // Save to Firestore
    await saveEmergencyContacts();

    // Clear form
    document.getElementById('addContactForm').reset();

    // Re-render contacts
    renderEmergencyContacts();

    showToast('Emergency contact added successfully', 'success');
}

function renderEmergencyContacts() {
    const contactsGrid = document.getElementById('contactsGrid');
    const contactCount = document.getElementById('contactCount');

    contactCount.textContent = emergencyContacts.length;
    document.getElementById('contactsCount').textContent = `${emergencyContacts.length}/5`;

    if (emergencyContacts.length === 0) {
        contactsGrid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke-width="2"/>
                    <circle cx="9" cy="7" r="4" stroke-width="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>
                </svg>
                <p>No emergency contacts added yet</p>
                <small>Add your first contact using the form</small>
            </div>
        `;
        return;
    }

    contactsGrid.innerHTML = emergencyContacts.map(contact => `
        <div class="contact-item">
            <div class="contact-avatar">${contact.name.charAt(0).toUpperCase()}</div>
            <div class="contact-details">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-phone">${contact.phone}</div>
                <div class="contact-relation">${capitalizeFirst(contact.relation)}</div>
            </div>
            <div class="contact-actions">
                <button class="icon-btn" onclick="callContact('${contact.phone}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke-width="2"/>
                    </svg>
                </button>
                <button class="icon-btn delete" onclick="deleteContact('${contact.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="3 6 5 6 21 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    updateDashboardStats();
}

async function saveEmergencyContacts() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            emergencyContacts: emergencyContacts,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving emergency contacts:', error);
    }
}

function callContact(phone) {
    window.location.href = `tel:${phone}`;
}

async function deleteContact(contactId) {
    if (!confirm('Are you sure you want to remove this emergency contact?')) {
        return;
    }

    emergencyContacts = emergencyContacts.filter(c => c.id !== contactId);
    await saveEmergencyContacts();
    renderEmergencyContacts();
    showToast('Contact removed successfully', 'success');
}

// ===================================
// AUTHORITY CONTACTS
// ===================================

async function handleSaveCollegeAuthority(e) {
    e.preventDefault();

    const name = document.getElementById('collegeName').value.trim();
    const department = document.getElementById('collegeDepartment').value.trim();
    const phone = document.getElementById('collegePhone').value.trim();
    const email = document.getElementById('collegeEmail').value.trim();

    authorityContacts.college = {
        name,
        department,
        phone,
        email,
        savedAt: new Date().toISOString()
    };

    await saveAuthorityContacts();
    renderCollegeAuthority();
    showToast('College authority contact saved successfully', 'success');
}

async function handleSaveHostelAuthority(e) {
    e.preventDefault();

    const name = document.getElementById('hostelName').value.trim();
    const warden = document.getElementById('hostelWarden').value.trim();
    const phone = document.getElementById('hostelPhone').value.trim();
    const email = document.getElementById('hostelEmail').value.trim();

    authorityContacts.hostel = {
        name,
        warden,
        phone,
        email,
        savedAt: new Date().toISOString()
    };

    await saveAuthorityContacts();
    renderHostelAuthority();
    showToast('Hostel authority contact saved successfully', 'success');
}

function renderCollegeAuthority() {
    const form = document.getElementById('collegeAuthorityForm');
    const savedInfo = document.getElementById('collegeSavedInfo');

    if (authorityContacts.college) {
        form.classList.add('hidden');
        savedInfo.classList.remove('hidden');

        document.getElementById('savedCollegeName').textContent =
            `${authorityContacts.college.name} - ${authorityContacts.college.department}`;
        document.getElementById('savedCollegePhone').textContent = authorityContacts.college.phone;
    }
}

function renderHostelAuthority() {
    const form = document.getElementById('hostelAuthorityForm');
    const savedInfo = document.getElementById('hostelSavedInfo');

    if (authorityContacts.hostel) {
        form.classList.add('hidden');
        savedInfo.classList.remove('hidden');

        document.getElementById('savedHostelName').textContent =
            `${authorityContacts.hostel.name} - ${authorityContacts.hostel.warden}`;
        document.getElementById('savedHostelPhone').textContent = authorityContacts.hostel.phone;
    }
}

function renderAuthorityContacts() {
    if (authorityContacts.college) renderCollegeAuthority();
    if (authorityContacts.hostel) renderHostelAuthority();
}

function editAuthority(type) {
    if (type === 'college') {
        document.getElementById('collegeAuthorityForm').classList.remove('hidden');
        document.getElementById('collegeSavedInfo').classList.add('hidden');

        // Pre-fill form
        if (authorityContacts.college) {
            document.getElementById('collegeName').value = authorityContacts.college.name;
            document.getElementById('collegeDepartment').value = authorityContacts.college.department;
            document.getElementById('collegePhone').value = authorityContacts.college.phone;
            document.getElementById('collegeEmail').value = authorityContacts.college.email;
        }
    } else if (type === 'hostel') {
        document.getElementById('hostelAuthorityForm').classList.remove('hidden');
        document.getElementById('hostelSavedInfo').classList.add('hidden');

        // Pre-fill form
        if (authorityContacts.hostel) {
            document.getElementById('hostelName').value = authorityContacts.hostel.name;
            document.getElementById('hostelWarden').value = authorityContacts.hostel.warden;
            document.getElementById('hostelPhone').value = authorityContacts.hostel.phone;
            document.getElementById('hostelEmail').value = authorityContacts.hostel.email;
        }
    }
}

async function saveAuthorityContacts() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            authorityContacts: authorityContacts,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving authority contacts:', error);
    }
}

// ===================================
// SAFETY MODE
// ===================================

async function handleSafetyModeToggle(e) {
    const enabled = e.target.checked;
    const statusText = document.getElementById('safetyModeStatus');

    if (enabled) {
        statusText.textContent = 'Active - You are protected';
        statusText.style.color = '#43e97b';
        showToast('Safety Mode activated', 'success');

        // Enable safety features if permissions granted
        if (permissionsGranted.microphone) {
            document.getElementById('voiceCommandToggle').disabled = false;
            document.getElementById('screamDetectionToggle').disabled = false;

            // Auto-enable voice commands (Task 4 requirement)
            const voiceToggle = document.getElementById('voiceCommandToggle');
            if (voiceToggle && !voiceToggle.checked) {
                voiceToggle.checked = true;
                // Trigger change event to start voice commands
                voiceToggle.dispatchEvent(new Event('change'));
            }
        }
        if (permissionsGranted.location) {
            document.getElementById('locationSharingToggle').disabled = false;
        }
    } else {
        statusText.textContent = 'Currently Inactive';
        statusText.style.color = 'var(--text-secondary)';
        showToast('Safety Mode deactivated', 'info');

        // Disable all features
        const voiceToggle = document.getElementById('voiceCommandToggle');
        if (voiceToggle && voiceToggle.checked) {
            voiceToggle.checked = false;
            // Trigger change event to stop voice commands
            voiceToggle.dispatchEvent(new Event('change'));
        }

        document.getElementById('screamDetectionToggle').checked = false;
        document.getElementById('locationSharingToggle').checked = false;
    }

    await saveSafetySettings();
}

async function handleVoiceCommandToggle(e) {
    const enabled = e.target.checked;
    const statusText = document.getElementById('voiceCommandStatus');
    const indicator = document.getElementById('voiceListeningIndicator');

    if (enabled) {
        // Request Microphone Permission first
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Permission granted
            permissionsGranted.microphone = true;
            // Update UI badge if visible
            const micBadge = document.querySelector('#microphonePermStatus .status-badge');
            if (micBadge) {
                micBadge.textContent = 'Granted';
                micBadge.className = 'status-badge granted';
            }

            stream.getTracks().forEach(track => track.stop()); // Close stream immediately

            // Enable Voice Manager
            if (window.voiceManager) {
                window.voiceManager.toggle(true);
                if (statusText) {
                    statusText.textContent = 'Active & Listening';
                    statusText.className = 'status-text active';
                }
                if (indicator) indicator.classList.remove('hidden');

                showToast('Voice Commands Activated. Say "Help" or "Emergency"', 'success');
            } else {
                e.target.checked = false;
                showToast('Voice Manager not loaded (Check scripts)', 'error');
            }
        } catch (error) {
            console.error('Mic permission denied:', error);
            e.target.checked = false;
            showToast('Microphone access is required for Voice Commands', 'error');
        }
    } else {
        // Disable Voice Manager
        if (window.voiceManager) {
            window.voiceManager.toggle(false);
        }
        if (statusText) {
            statusText.textContent = 'Inactive';
            statusText.className = 'status-text';
        }
        if (indicator) indicator.classList.add('hidden');
        showToast('Voice commands disabled', 'info');
    }

    // Save preference
    if (currentUser) {
        try {
            await db.collection('users').doc(currentUser.uid).update({
                'safetyMode.voiceCommandsEnabled': enabled
            });
        } catch (error) {
            console.error('Error saving voice preference:', error);
        }
    }
}

async function handleScreamDetectionToggle(e) {
    const enabled = e.target.checked;

    if (enabled) {
        if (typeof startScreamDetection === 'function') {
            const success = await startScreamDetection();
            if (success) {
                permissionsGranted.microphone = true;
                showToast('Scream detection enabled', 'success');
            } else {
                e.target.checked = false;
                // startScreamDetection handles error toasts
                return;
            }
        } else {
            e.target.checked = false;
            showToast('Scream module not loaded', 'error');
            return;
        }
    } else {
        if (typeof stopScreamDetection === 'function') {
            stopScreamDetection();
        }
        showToast('Scream detection disabled', 'info');
    }
    await saveSafetySettings();
}

async function handleLocationSharingToggle(e) {
    const enabled = e.target.checked;

    if (enabled && !permissionsGranted.location) {
        e.target.checked = false;
        showToast('Please grant location permission first', 'error');
        navigateToSection('permissions');
        return;
    }

    if (enabled) {
        showToast('Location sharing enabled', 'success');
    } else {
        showToast('Location sharing disabled', 'info');
    }

    await saveSafetySettings();
}

async function handleBatteryAlertsToggle(e) {
    const enabled = e.target.checked;

    if (enabled) {
        showToast('Battery alerts enabled', 'success');
        // Start battery monitoring (from battery.js)
        if (typeof startBatteryMonitoring === 'function') {
            startBatteryMonitoring();
        }
    } else {
        showToast('Battery alerts disabled', 'info');
    }

    await saveSafetySettings();
}

async function saveSafetySettings() {
    try {
        const settings = {
            enabled: document.getElementById('safetyModeToggle').checked,
            voiceCommandsEnabled: document.getElementById('voiceCommandToggle').checked,
            screamDetectionEnabled: document.getElementById('screamDetectionToggle').checked,
            locationSharingEnabled: document.getElementById('locationSharingToggle').checked,
            batteryAlertsEnabled: document.getElementById('batteryAlertsToggle').checked
        };

        await db.collection('users').doc(currentUser.uid).update({
            safetyMode: settings,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving safety settings:', error);
    }
}

function applySafetySettings(settings) {
    if (settings.enabled) {
        document.getElementById('safetyModeToggle').checked = true;
        document.getElementById('safetyModeStatus').textContent = 'Active - You are protected';
    }
    if (settings.voiceCommandsEnabled) {
        document.getElementById('voiceCommandToggle').checked = true;
    }
    if (settings.screamDetectionEnabled) {
        document.getElementById('screamDetectionToggle').checked = true;
    }
    if (settings.locationSharingEnabled) {
        document.getElementById('locationSharingToggle').checked = true;
    }
    if (settings.batteryAlertsEnabled) {
        document.getElementById('batteryAlertsToggle').checked = true;
    }
}

// ===================================
// DASHBOARD STATS UPDATE
// ===================================

function updateDashboardStats() {
    // Update location status
    if (permissionsGranted.location) {
        document.getElementById('locationStatus').textContent = 'Enabled';
    }

    // Update microphone status
    if (permissionsGranted.microphone) {
        document.getElementById('microphoneStatus').textContent = 'Enabled';
    }

    // Update contacts count
    document.getElementById('contactsCount').textContent = `${emergencyContacts.length}/5`;

    // Update services count
    let servicesCount = 0;
    if (emergencyServices.police) servicesCount++;
    if (emergencyServices.helpline) servicesCount++;
    document.getElementById('servicesCount').textContent = `${servicesCount}/2`;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    toastMessage.textContent = message;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    toastIcon.textContent = icons[type] || icons.info;

    toast.classList.remove('success', 'error', 'info');
    toast.classList.add(type);
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions globally available
window.callContact = callContact;
window.deleteContact = deleteContact;
window.editAuthority = editAuthority;
window.showToast = showToast;

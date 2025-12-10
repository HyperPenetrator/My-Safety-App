// ===================================
// MOBILE DASHBOARD LOGIC
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    checkAuthStatus();
});

// Global state
let currentUser = null;

function initializeDashboard() {
    // Hide all sections except home
    showSection('home');

    // Update permission counts
    updateStats();
}

function setupEventListeners() {
    // Menu Toggle
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');

    if (menuBtn && sideMenu) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.add('open');
        });
    }

    if (closeMenuBtn && sideMenu) {
        closeMenuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('open');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (sideMenu && sideMenu.classList.contains('open') &&
            !sideMenu.contains(e.target) &&
            !menuBtn.contains(e.target)) {
            sideMenu.classList.remove('open');
        }
    });

    // Navigation (Bottom Bar)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked
            const target = e.currentTarget;
            target.classList.add('active');

            // Show section
            const sectionName = target.getAttribute('data-section');
            showSection(sectionName);
        });
    });

    // Navigation (Side Drawer)
    const drawerItems = document.querySelectorAll('.nav-drawer-item');
    // sideMenu is already declared at the top of setupEventListeners
    drawerItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const sectionName = e.currentTarget.getAttribute('data-section');

            // 1. Show Section
            showSection(sectionName);

            // 2. Update Bottom Nav Active State
            navItems.forEach(nav => {
                if (nav.getAttribute('data-section') === sectionName) {
                    nav.classList.add('active');
                } else {
                    nav.classList.remove('active');
                }
            });

            // 3. Close Drawer
            if (sideMenu) sideMenu.classList.remove('open');
        });
    });

    // Add Contact Button
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            console.log('Add Contact Clicked');
            addContact();
        });
    }

    // Quick Actions
    const permissionsCard = document.getElementById('permissionsCard');
    if (permissionsCard) {
        permissionsCard.addEventListener('click', () => showSection('permissions'));
    }

    const locationCard = document.getElementById('locationCard');
    if (locationCard) {
        locationCard.addEventListener('click', () => showSection('location'));
    }

    // Side Menu Buttons
    const switchToDesktopBtn = document.getElementById('switchToDesktopBtn');
    if (switchToDesktopBtn) {
        switchToDesktopBtn.addEventListener('click', switchToDesktop);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const settingsBtn = document.getElementById('openSettingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettings);
    }

    // SOS Button
    const sosBtn = document.getElementById('sosButton');
    if (sosBtn) {
        let pressTimer;

        // Touch start / Mouse down
        const startEvent = (e) => {
            e.preventDefault();
            sosBtn.style.transform = 'scale(0.95)';
            // Start 3s countdown handled by emergency system
            if (window.emergencyCallSystem) {
                window.emergencyCallSystem.startEmergencySequence();
            } else {
                alert('Emergency system not initialized');
            }
        };

        // Touch end / Mouse up
        const endEvent = (e) => {
            e.preventDefault();
            sosBtn.style.transform = 'scale(1)';
        };

        sosBtn.addEventListener('mousedown', startEvent);
        sosBtn.addEventListener('touchstart', startEvent);
        sosBtn.addEventListener('mouseup', endEvent);
        sosBtn.addEventListener('touchend', endEvent);
    }

    // Safety Toggle
    const safetyToggle = document.getElementById('safetyToggle');
    if (safetyToggle) {
        safetyToggle.addEventListener('change', (e) => {
            toggleSafetyMode(e.target.checked);
        });
    }
}

// Show specific section
function showSection(sectionName) {
    // Save current section logic implementation later if needed
    // For now, we mainly have the home dashboard view
    console.log(`Navigating to ${sectionName}`);

    if (sectionName === 'contacts') {
        // Just scroll to contacts section or show modal
        const contactsSection = document.getElementById('quickContacts');
        if (contactsSection) {
            contactsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Check Authentication
function checkAuthStatus() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadUserData(user);
        } else {
            // Redirect to auth if not logged in
            window.location.href = 'auth.html';
        }
    });
}

// Load User Data
async function loadUserData(user) {
    const db = firebase.firestore();
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            updateUIWithUserData(data);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function updateUIWithUserData(data) {
    // Update safety status, etc.
    const statusEl = document.getElementById('safetyStatus');
    const toggleEl = document.getElementById('safetyToggle');

    if (data.safetyMode && statusEl) {
        // Handle object or boolean structure
        const isSafetyActive = typeof data.safetyMode === 'object' ? data.safetyMode.enabled : data.safetyMode;

        statusEl.textContent = isSafetyActive ? 'Active' : 'Inactive';
        statusEl.style.color = isSafetyActive ? '#4CAF50' : '#666';
        if (toggleEl) toggleEl.checked = isSafetyActive;

        // Auto-enable Voice Commands if saved
        if (typeof data.safetyMode === 'object' && data.safetyMode.voiceCommandsEnabled) {
            if (window.voiceManager && !window.voiceManager.isListening) {
                console.log('Auto-enabling Voice Commands from profile');
                window.voiceManager.toggle(true);
            }
        }
    }
}

// Toggle Safety Mode
async function toggleSafetyMode(enabled) {
    if (!currentUser) return;

    const statusEl = document.getElementById('safetyStatus');
    if (statusEl) {
        statusEl.textContent = enabled ? 'Active' : 'Inactive';
        statusEl.style.color = enabled ? '#4CAF50' : '#666';
    }

    try {
        await firebase.firestore().collection('users').doc(currentUser.uid).update({
            safetyMode: enabled,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating safety mode:", error);
        // Revert UI if failed
        if (statusEl) statusEl.textContent = !enabled ? 'Active' : 'Inactive';
    }
}

function updateStats() {
    // Update permission count
    if (window.permissionManager) {
        const stats = window.permissionManager.getPermissionSummary();
        const countEl = document.getElementById('permissionCount');
        if (countEl) {
            countEl.textContent = `${stats.granted}/${stats.total} granted`;
        }
    }
}

// Add Contact Logic
async function addContact() {
    if (window.contactsManager && window.contactsManager.isSupported()) {
        const result = await contactsManager.selectContacts();
        if (result.success) {
            await saveImportedContacts(result.contacts);
        } else if (result.error !== 'cancelled') {
            alert('Error importing contacts. Please try manual entry.');
            showManualAddContact();
        }
    } else {
        showManualAddContact();
    }
}

async function saveImportedContacts(contacts) {
    if (!currentUser) return;

    const db = firebase.firestore();
    const userRef = db.collection('users').doc(currentUser.uid);

    try {
        const doc = await userRef.get();
        let currentContacts = [];
        if (doc.exists && doc.data().emergencyContacts) {
            currentContacts = doc.data().emergencyContacts;
        }

        // Add new contacts (limit to 5)
        let addedCount = 0;
        for (const contact of contacts) {
            if (currentContacts.length >= 5) break;

            currentContacts.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                name: contact.name,
                phone: contact.phone,
                relation: 'Imported',
                email: '',
                addedAt: new Date().toISOString()
            });
            addedCount++;
        }

        if (addedCount > 0) {
            await userRef.update({
                emergencyContacts: currentContacts,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reload UI
            loadUserData(currentUser);
            alert(`Successfully added ${addedCount} contacts`);
        } else {
            alert('Contact list full (max 5)');
        }
    } catch (error) {
        console.error("Error saving contacts:", error);
        alert("Failed to save contacts");
    }
}

function showManualAddContact() {
    // Simple prompt for now, can be replaced with modal later
    const name = prompt("Enter Contact Name:");
    if (!name) return;

    const phone = prompt("Enter Phone Number:");
    if (!phone) return;

    saveImportedContacts([{ name, phone }]);
}

// Switch to Desktop Version
function switchToDesktop() {
    console.log("Switching to desktop...");
    if (typeof switchVersion === 'function') {
        switchVersion('desktop');
    } else {
        console.error("switchVersion function not found. Ensure mobile-detector.js is loaded.");
        // Fallback
        localStorage.setItem('mysafety_version_preference', 'desktop');
        window.location.href = 'dashboard.html';
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'auth.html';
    });
}

function showSettings() {
    alert("Settings coming soon!");
}

window.addContact = addContact;
window.switchToDesktop = switchToDesktop;
window.logout = logout;
window.showSettings = showSettings;
window.showSection = showSection;

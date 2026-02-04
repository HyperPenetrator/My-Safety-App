// ===================================
// SEQUENTIAL CALL API SYSTEM
// ===================================

class EmergencyCallSystem {
    constructor() {
        this.contacts = [];
        this.currentCallIndex = 0;
        this.callAttempts = [];
        this.isEmergencyActive = false;
    }

    // Load emergency contacts from Firestore
    async loadContacts() {
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No user authenticated - contacts cannot be loaded');
                this.contacts = [];
                return [];
            }

            const db = firebase.firestore();

            // Check if offline
            const isOffline = !navigator.onLine;
            if (isOffline) {
                console.warn('⚠️ Device is offline - using cached contacts if available');
                // Try to get from local cache
                const cachedContacts = this.getFromLocalCache();
                if (cachedContacts.length > 0) {
                    this.contacts = cachedContacts;
                    return this.contacts;
                }
            }

            // Read from array field instead of subcollection
            const userDoc = await db.collection('users').doc(user.uid).get();

            if (userDoc.exists && userDoc.data().emergencyContacts) {
                const contacts = userDoc.data().emergencyContacts;
                // Take first 3 contacts
                this.contacts = contacts.slice(0, 3);

                // Cache for offline use
                this.saveToLocalCache(this.contacts);

                console.log(`✅ Loaded ${this.contacts.length} emergency contacts:`, this.contacts.map(c => c.name));
                return this.contacts;
            } else {
                console.warn('No emergency contacts found in user document');
                this.contacts = [];
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading contacts:', error.message);

            // Try local cache as fallback
            const cachedContacts = this.getFromLocalCache();
            if (cachedContacts.length > 0) {
                console.log('✓ Using cached contacts from previous session');
                this.contacts = cachedContacts;
                return this.contacts;
            }

            this.contacts = [];
            return [];
        }
    }

    // Cache management for offline support
    saveToLocalCache(contacts) {
        try {
            localStorage.setItem('mysafety_cached_contacts', JSON.stringify(contacts));
        } catch (e) {
            console.warn('Could not cache contacts:', e);
        }
    }

    getFromLocalCache() {
        try {
            const cached = localStorage.getItem('mysafety_cached_contacts');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            console.warn('Could not retrieve cached contacts:', e);
            return [];
        }
    }

    // Make a call to specific contact
    makeCall(contact) {
        if (!contact || !contact.phone) {
            console.error('Invalid contact for calling');
            alert('Cannot call: Contact has no phone number');
            return false;
        }

        // Clean phone number thoroughly
        let cleanPhone = contact.phone.toString().trim();

        // Remove all non-numeric characters except + (for country code)
        cleanPhone = cleanPhone.replace(/[^\d+]/g, '');

        // Auto-add country code if missing (default to India +91)
        if (!cleanPhone.startsWith('+')) {
            // If it starts with 0, remove it (common in Indian numbers)
            if (cleanPhone.startsWith('0')) {
                cleanPhone = cleanPhone.substring(1);
            }
            // Add +91 if it's a 10-digit number
            if (cleanPhone.length === 10) {
                cleanPhone = '+91' + cleanPhone;
            }
        }

        console.log(`📞 Attempting to call: ${contact.name} at ${cleanPhone}`);

        // Log the call attempt
        this.callAttempts.push({
            contact: contact.name,
            phone: cleanPhone,
            timestamp: new Date(),
            status: 'initiated'
        });

        // Try multiple methods for maximum compatibility
        try {
            // Method 1: window.location (most compatible)
            window.location.href = `tel:${cleanPhone}`;

            // Method 2: Fallback after 500ms if Method 1 fails
            setTimeout(() => {
                try {
                    // Create an invisible anchor element
                    const telLink = document.createElement('a');
                    telLink.href = `tel:${cleanPhone}`;
                    telLink.style.display = 'none';
                    document.body.appendChild(telLink);
                    telLink.click();
                    document.body.removeChild(telLink);
                } catch (e) {
                    console.error('Fallback method failed:', e);
                }
            }, 500);

            // Show confirmation
            console.log('✅ Call initiated successfully');
            return true;

        } catch (error) {
            console.error('Error initiating call:', error);

            // Final fallback: Ask user to call manually
            const shouldCopyNumber = confirm(
                `Could not open dialer automatically.\n\n` +
                `Contact: ${contact.name}\n` +
                `Number: ${cleanPhone}\n\n` +
                `Click OK to copy number to clipboard.`
            );

            if (shouldCopyNumber) {
                this.copyToClipboard(cleanPhone);
            }

            return false;
        }
    }

    // Helper function to copy to clipboard
    copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    alert(`Number copied: ${text}\nPlease dial manually.`);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert(`Number copied: ${text}\nPlease dial manually.`);
            }
        } catch (e) {
            alert(`Please call: ${text}`);
        }
    }

    // Start emergency call sequence
    async startEmergencySequence() {
        if (this.isEmergencyActive) {
            console.log('Emergency sequence already active');
            return;
        }

        this.isEmergencyActive = true;
        this.currentCallIndex = 0;
        this.callAttempts = [];

        // Load contacts if not already loaded
        if (this.contacts.length === 0) {
            console.log('Contacts not loaded, fetching now...');
            await this.loadContacts();
        }

        if (this.contacts.length === 0) {
            this.isEmergencyActive = false;

            // Better user guidance
            const shouldAddContacts = confirm(
                '⚠️ NO EMERGENCY CONTACTS FOUND\n\n' +
                'You need to add emergency contacts before using SOS features.\n\n' +
                'Click OK to add contacts now, or Cancel to dismiss.'
            );

            if (shouldAddContacts) {
                // Navigate to contacts section
                if (typeof showSection === 'function') {
                    showSection('contacts');
                } else if (typeof navigateToSection === 'function') {
                    navigateToSection('contacts');
                }
            }
            return;
        }

        // Show emergency modal
        this.showEmergencyModal();
    }

    // Show emergency call modal with countdown
    showEmergencyModal() {
        const modal = document.createElement('div');
        modal.id = 'emergency-call-modal';
        modal.className = 'emergency-modal';
        modal.innerHTML = `
            <div class="emergency-modal-content">
                <div class="emergency-header">
                    <h2>🚨 EMERGENCY CALL SEQUENCE</h2>
                </div>
                <div class="emergency-body">
                    <div class="countdown-circle">
                        <span id="emergency-countdown">3</span>
                    </div>
                    <p class="emergency-text">Calling emergency contacts...</p>
                    <div class="contact-list" id="emergency-contact-list">
                        ${this.contacts.map((contact, index) => `
                            <div class="contact-item" id="contact-${index}">
                                <span class="contact-number">${index + 1}</span>
                                <span class="contact-name">${contact.name}</span>
                                <span class="contact-phone">${contact.phone}</span>
                                <span class="contact-status" id="status-${index}">⏳ Waiting</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="emergency-actions">
                    <button class="cancel-emergency-btn" id="cancelEmergencyCall">
                        Cancel Emergency
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add cancel functionality
        document.getElementById('cancelEmergencyCall').addEventListener('click', () => {
            this.cancelEmergency();
        });

        // Start countdown
        this.startCountdown();
    }

    // Countdown before calling
    startCountdown() {
        let count = 3;
        const countdownEl = document.getElementById('emergency-countdown');

        const countdownInterval = setInterval(() => {
            count--;
            if (countdownEl) {
                countdownEl.textContent = count;
            }

            if (count <= 0) {
                clearInterval(countdownInterval);
                this.callNextContact();
            }
        }, 1000);

        // Store interval for cancellation
        this.countdownInterval = countdownInterval;
    }

    // Call next contact in sequence
    callNextContact() {
        if (this.currentCallIndex >= this.contacts.length) {
            // All contacts called
            this.showCompletionMessage();
            return;
        }

        const contact = this.contacts[this.currentCallIndex];

        // Update UI
        const statusEl = document.getElementById(`status-${this.currentCallIndex}`);
        if (statusEl) {
            statusEl.textContent = '📞 Calling...';
            statusEl.style.color = '#4CAF50';
        }

        // Make the call
        this.makeCall(contact);

        // Show next contact dialog after delay
        setTimeout(() => {
            this.showNextContactDialog();
        }, 5000); // Wait 5 seconds before showing next contact option
    }

    // Show dialog to call next contact
    showNextContactDialog() {
        const statusEl = document.getElementById(`status-${this.currentCallIndex}`);
        if (statusEl) {
            statusEl.textContent = '✓ Called';
            statusEl.style.color = '#888';
        }

        this.currentCallIndex++;

        if (this.currentCallIndex >= this.contacts.length) {
            this.showCompletionMessage();
            return;
        }

        // Show next contact prompt
        const nextContact = this.contacts[this.currentCallIndex];
        const shouldCallNext = confirm(
            `Call next contact?\n\n${nextContact.name}\n${nextContact.phone}\n\nClick OK to call, Cancel to stop.`
        );

        if (shouldCallNext) {
            this.callNextContact();
        } else {
            this.cancelEmergency();
        }
    }

    // Show completion message
    showCompletionMessage() {
        const modal = document.getElementById('emergency-call-modal');
        if (modal) {
            modal.querySelector('.emergency-body').innerHTML = `
                <div class="completion-message">
                    <div class="completion-icon">✓</div>
                    <h3>All Emergency Contacts Called</h3>
                    <p>Called ${this.contacts.length} contact(s)</p>
                    <div class="call-log">
                        ${this.callAttempts.map(attempt => `
                            <div class="call-log-item">
                                <strong>${attempt.contact}</strong> - ${attempt.phone}
                                <br><small>${attempt.timestamp.toLocaleTimeString()}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            // Auto-close after 5 seconds
            setTimeout(() => {
                this.closeModal();
            }, 5000);
        }

        this.isEmergencyActive = false;
    }

    // Cancel emergency sequence
    cancelEmergency() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.isEmergencyActive = false;
        this.closeModal();

        showToast('Emergency call sequence cancelled', 'info');
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('emergency-call-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Quick call to specific contact (no sequence)
    quickCall(contactIndex) {
        if (contactIndex >= this.contacts.length) {
            alert('Contact not found');
            return;
        }

        const contact = this.contacts[contactIndex];

        if (confirm(`Call ${contact.name}?\n${contact.phone}`)) {
            this.makeCall(contact);
        }
    }
}

// Global instance
const emergencyCallSystem = new EmergencyCallSystem();
window.emergencyCallSystem = emergencyCallSystem;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    emergencyCallSystem.loadContacts();
});

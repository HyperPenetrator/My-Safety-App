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
            if (!user) return [];

            const db = firebase.firestore();
            const contactsSnapshot = await db.collection('users')
                .doc(user.uid)
                .collection('emergencyContacts')
                .orderBy('priority', 'asc')
                .limit(3)
                .get();

            this.contacts = contactsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return this.contacts;
        } catch (error) {
            console.error('Error loading contacts:', error);
            return [];
        }
    }

    // Make a call to specific contact
    makeCall(contact) {
        if (!contact || !contact.phone) {
            console.error('Invalid contact for calling');
            return false;
        }

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = contact.phone.replace(/[\s\-\(\)]/g, '');

        // Log the call attempt
        this.callAttempts.push({
            contact: contact.name,
            phone: cleanPhone,
            timestamp: new Date(),
            status: 'initiated'
        });

        // Use tel: protocol to initiate call
        window.location.href = `tel:${cleanPhone}`;

        return true;
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
            await this.loadContacts();
        }

        if (this.contacts.length === 0) {
            alert('No emergency contacts configured. Please add contacts first.');
            this.isEmergencyActive = false;
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

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    emergencyCallSystem.loadContacts();
});

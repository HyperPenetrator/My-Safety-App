// ===================================
// CONTACTS API MANAGER
// ===================================

class ContactsManager {
    constructor() {
        // Check if the Contact Picker API is supported
        this.supported = ('contacts' in navigator && 'ContactsManager' in window);
    }

    // Check if API is supported
    isSupported() {
        return this.supported;
    }

    // Select contacts from device
    async selectContacts() {
        if (!this.supported) {
            console.log("Contacts API not supported on this device/browser.");
            return { success: false, error: 'not_supported' };
        }

        try {
            const props = ['name', 'tel'];
            const opts = { multiple: true };

            const contacts = await navigator.contacts.select(props, opts);

            if (contacts && contacts.length > 0) {
                return { success: true, contacts: this.normalizeContacts(contacts) };
            } else {
                return { success: false, error: 'cancelled' };
            }
        } catch (ex) {
            console.error("Error selecting contacts:", ex);
            return { success: false, error: ex.message };
        }
    }

    // Normalize contact data structure
    normalizeContacts(rawContacts) {
        return rawContacts.map(c => ({
            name: c.name[0] || 'Unknown',
            phone: c.tel[0] || '',
            email: ''
        })).filter(c => c.phone); // Filter out contacts without phone numbers
    }
}

// Global instance
const contactsManager = new ContactsManager();

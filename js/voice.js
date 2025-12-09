// ===================================
// MULTILINGUAL VOICE COMMANDS
// My Safety App - Voice-Activated Emergency System
// ===================================

// Global variables for voice recognition
let voiceRecognition = {
    enabled: false,
    recognition: null,
    isListening: false,
    language: 'en-IN', // Default language
    supportedLanguages: [],
    helpKeywords: {},
    lastCommand: null,
    confidenceThreshold: 0.6
};

// Multilingual help keywords
const HELP_KEYWORDS = {
    // English
    'en-IN': ['help', 'emergency', 'danger', 'sos', 'save me', 'help me'],
    'en-US': ['help', 'emergency', 'danger', 'sos', 'save me', 'help me'],
    'en-GB': ['help', 'emergency', 'danger', 'sos', 'save me', 'help me'],

    // Hindi (Devanagari script)
    'hi-IN': ['मदद', 'बचाओ', 'हेल्प', 'खतरा', 'एसओएस', 'मुझे बचाओ', 'सहायता'],

    // Tamil
    'ta-IN': ['உதவி', 'காப்பாற்று', 'ஹெல்ப்', 'ஆபத்து', 'எஸ்ஓஎஸ்', 'என்னை காப்பாற்று'],

    // Telugu
    'te-IN': ['సహాయం', 'రక్షించు', 'హెల్ప్', 'ప్రమాదం', 'ఎస్ఓఎస్', 'నన్ను రక్షించండి'],

    // Kannada
    'kn-IN': ['ಸಹಾಯ', 'ರಕ್ಷಿಸು', 'ಹೆಲ್ಪ್', 'ಅಪಾಯ', 'ಎಸ್ಓಎಸ್', 'ನನ್ನನ್ನು ರಕ್ಷಿಸಿ'],

    // Malayalam
    'ml-IN': ['സഹായം', 'രക്ഷിക്കുക', 'ഹെൽപ്', 'അപകടം', 'എസ്ഓഎസ്', 'എന്നെ രക്ഷിക്കുക'],

    // Bengali
    'bn-IN': ['সাহায্য', 'বাঁচাও', 'হেল্প', 'বিপদ', 'এসওএস', 'আমাকে বাঁচাও'],

    // Marathi
    'mr-IN': ['मदत', 'वाचवा', 'हेल्प', 'धोका', 'एसओएस', 'मला वाचवा'],

    // Gujarati
    'gu-IN': ['મદદ', 'બચાવો', 'હેલ્પ', 'જોખમ', 'એસઓએસ', 'મને બચાવો'],

    // Punjabi
    'pa-IN': ['ਮਦਦ', 'ਬਚਾਓ', 'ਹੈਲਪ', 'ਖ਼ਤਰਾ', 'ਐਸਓਐਸ', 'ਮੈਨੂੰ ਬਚਾਓ'],

    // Odia
    'or-IN': ['ସାହାଯ୍ୟ', 'ବଞ୍ଚାଅ', 'ହେଲ୍ପ', 'ବିପଦ', 'ଏସଓଏସ', 'ମୋତେ ବଞ୍ଚାଅ'],

    // Urdu
    'ur-IN': ['مدد', 'بچاؤ', 'ہیلپ', 'خطرہ', 'ایس او ایس', 'مجھے بچاؤ'],

    // Assamese
    'as-IN': ['সহায়', 'বচোৱা', 'হেল্প', 'বিপদ', 'এছঅ'এছ', 'মোক বচোৱা', 'সাহায্য'],

    // Additional languages
    'es-ES': ['ayuda', 'emergencia', 'peligro', 'sos', 'sálvame'],
        'fr-FR': ['aide', 'urgence', 'danger', 'sos', 'sauvez-moi'],
        'de-DE': ['hilfe', 'notfall', 'gefahr', 'sos', 'rette mich'],
        'pt-BR': ['ajuda', 'emergência', 'perigo', 'sos', 'me salve'],
        'ja-JP': ['助けて', 'ヘルプ', '緊急', '危険', 'エスオーエス'],
        'zh-CN': ['帮助', '救命', '紧急', '危险', '求救'],
        'ar-SA': ['مساعدة', 'نجدة', 'خطر', 'استغاثة', 'أنقذني']
};

// Language names for UI
const LANGUAGE_NAMES = {
    'en-IN': 'English (India)',
    'hi-IN': 'हिन्दी (Hindi)',
    'ta-IN': 'தமிழ் (Tamil)',
    'te-IN': 'తెలుగు (Telugu)',
    'kn-IN': 'ಕನ್ನಡ (Kannada)',
    'ml-IN': 'മലയാളം (Malayalam)',
    'bn-IN': 'বাংলা (Bengali)',
    'mr-IN': 'मराठी (Marathi)',
    'gu-IN': 'ગુજરાતી (Gujarati)',
    'pa-IN': 'ਪੰਜਾਬੀ (Punjabi)',
    'or-IN': 'ଓଡ଼ିଆ (Odia)',
    'ur-IN': 'اردو (Urdu)',
    'as-IN': 'অসমীয়া (Assamese)',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Español (Spanish)',
    'fr-FR': 'Français (French)',
    'de-DE': 'Deutsch (German)',
    'pt-BR': 'Português (Portuguese)',
    'ja-JP': '日本語 (Japanese)',
    'zh-CN': '中文 (Chinese)',
    'ar-SA': 'العربية (Arabic)'
};

// ===================================
// INITIALIZATION
// ===================================

function initializeVoiceCommands() {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Speech recognition not supported in this browser');
        showToast('Voice commands not supported in this browser', 'error');
        return false;
    }

    // Get supported languages
    voiceRecognition.supportedLanguages = Object.keys(HELP_KEYWORDS);

    // Load saved language preference
    loadVoiceSettings();

    // Setup recognition
    setupSpeechRecognition();

    console.log('Voice commands initialized');
    console.log(`Supported languages: ${voiceRecognition.supportedLanguages.length}`);

    return true;
}

// ===================================
// SPEECH RECOGNITION SETUP
// ===================================

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error('SpeechRecognition not available');
        return;
    }

    voiceRecognition.recognition = new SpeechRecognition();

    // Configure recognition
    voiceRecognition.recognition.continuous = true; // Keep listening
    voiceRecognition.recognition.interimResults = false; // Only final results
    voiceRecognition.recognition.maxAlternatives = 3; // Get top 3 alternatives
    voiceRecognition.recognition.lang = voiceRecognition.language;

    // Event handlers
    voiceRecognition.recognition.onstart = handleRecognitionStart;
    voiceRecognition.recognition.onend = handleRecognitionEnd;
    voiceRecognition.recognition.onresult = handleRecognitionResult;
    voiceRecognition.recognition.onerror = handleRecognitionError;
    voiceRecognition.recognition.onnomatch = handleNoMatch;

    console.log('Speech recognition configured');
}

// ===================================
// VOICE COMMAND CONTROL
// ===================================

function startVoiceCommands() {
    if (!voiceRecognition.recognition) {
        console.error('Speech recognition not initialized');
        showToast('Voice recognition not available', 'error');
        return false;
    }

    if (voiceRecognition.isListening) {
        console.log('Voice commands already active');
        return true;
    }

    try {
        voiceRecognition.recognition.start();
        voiceRecognition.enabled = true;
        voiceRecognition.isListening = true;

        console.log('Voice commands started');
        console.log(`Listening in: ${LANGUAGE_NAMES[voiceRecognition.language]}`);

        showToast(`Voice commands active (${LANGUAGE_NAMES[voiceRecognition.language]})`, 'success');
        updateVoiceCommandUI();

        // Save state
        saveVoiceSettings();

        return true;
    } catch (error) {
        console.error('Error starting voice commands:', error);
        showToast('Error starting voice commands', 'error');
        return false;
    }
}

function stopVoiceCommands() {
    if (!voiceRecognition.isListening) {
        return;
    }

    try {
        voiceRecognition.recognition.stop();
        voiceRecognition.enabled = false;
        voiceRecognition.isListening = false;

        console.log('Voice commands stopped');
        showToast('Voice commands deactivated', 'info');
        updateVoiceCommandUI();

        // Save state
        saveVoiceSettings();
    } catch (error) {
        console.error('Error stopping voice commands:', error);
    }
}

function changeVoiceLanguage(languageCode) {
    if (!HELP_KEYWORDS[languageCode]) {
        console.error('Language not supported:', languageCode);
        return false;
    }

    const wasListening = voiceRecognition.isListening;

    // Stop if currently listening
    if (wasListening) {
        stopVoiceCommands();
    }

    // Change language
    voiceRecognition.language = languageCode;

    if (voiceRecognition.recognition) {
        voiceRecognition.recognition.lang = languageCode;
    }

    console.log(`Language changed to: ${LANGUAGE_NAMES[languageCode]}`);
    showToast(`Language: ${LANGUAGE_NAMES[languageCode]}`, 'success');

    // Restart if was listening
    if (wasListening) {
        setTimeout(() => startVoiceCommands(), 500);
    }

    // Update UI
    updateLanguageUI();

    // Save preference
    saveVoiceSettings();

    return true;
}

// ===================================
// RECOGNITION EVENT HANDLERS
// ===================================

function handleRecognitionStart() {
    console.log('Voice recognition started');
    voiceRecognition.isListening = true;
    updateVoiceCommandUI();
}

function handleRecognitionEnd() {
    console.log('Voice recognition ended');
    voiceRecognition.isListening = false;

    // Auto-restart if still enabled
    if (voiceRecognition.enabled) {
        setTimeout(() => {
            try {
                voiceRecognition.recognition.start();
            } catch (error) {
                console.error('Error restarting recognition:', error);
            }
        }, 1000);
    }

    updateVoiceCommandUI();
}

function handleRecognitionResult(event) {
    const results = event.results;
    const lastResultIndex = results.length - 1;
    const result = results[lastResultIndex];

    if (!result.isFinal) {
        return; // Only process final results
    }

    // Get all alternatives
    const alternatives = [];
    for (let i = 0; i < result.length; i++) {
        alternatives.push({
            transcript: result[i].transcript.toLowerCase().trim(),
            confidence: result[i].confidence
        });
    }

    console.log('Voice input received:', alternatives);

    // Check each alternative for help keywords
    for (const alt of alternatives) {
        if (alt.confidence >= voiceRecognition.confidenceThreshold) {
            if (isHelpCommand(alt.transcript)) {
                handleHelpCommand(alt.transcript, alt.confidence);
                return;
            }
        }
    }

    // Log unrecognized command
    console.log('No help keyword detected in:', alternatives[0].transcript);
}

function handleRecognitionError(event) {
    console.error('Speech recognition error:', event.error);

    let message = 'Voice recognition error';

    switch (event.error) {
        case 'no-speech':
            // No speech detected, this is normal
            return;
        case 'audio-capture':
            message = 'Microphone not accessible';
            break;
        case 'not-allowed':
            message = 'Microphone permission denied';
            voiceRecognition.enabled = false;
            break;
        case 'network':
            message = 'Network error in voice recognition';
            break;
        case 'aborted':
            // Recognition aborted, will restart
            return;
        default:
            message = `Voice error: ${event.error}`;
    }

    showToast(message, 'error');

    // Stop if permission denied
    if (event.error === 'not-allowed') {
        stopVoiceCommands();
    }
}

function handleNoMatch() {
    console.log('No speech match found');
}

// ===================================
// HELP COMMAND DETECTION
// ===================================

function isHelpCommand(transcript) {
    const keywords = HELP_KEYWORDS[voiceRecognition.language] || [];

    // Check if transcript contains any help keyword
    for (const keyword of keywords) {
        if (transcript.includes(keyword.toLowerCase())) {
            return true;
        }
    }

    // Also check English keywords as fallback
    if (voiceRecognition.language !== 'en-IN') {
        const englishKeywords = HELP_KEYWORDS['en-IN'] || [];
        for (const keyword of englishKeywords) {
            if (transcript.includes(keyword.toLowerCase())) {
                return true;
            }
        }
    }

    return false;
}

function handleHelpCommand(transcript, confidence) {
    console.log(`HELP COMMAND DETECTED: "${transcript}" (confidence: ${confidence})`);

    voiceRecognition.lastCommand = {
        transcript: transcript,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        language: voiceRecognition.language
    };

    // Show alert
    showHelpCommandAlert(transcript, confidence);

    // Trigger emergency protocol
    triggerEmergencyProtocol('voice_command');

    // Log to history
    logVoiceCommand(transcript, confidence);
}

// ===================================
// EMERGENCY PROTOCOL
// ===================================

async function triggerEmergencyProtocol(trigger = 'voice_command') {
    console.log('🚨 EMERGENCY PROTOCOL ACTIVATED 🚨');
    console.log('Trigger:', trigger);

    // Show emergency modal
    showEmergencyActivationModal();

    // Start countdown (5 seconds to cancel)
    let countdown = 5;
    const countdownInterval = setInterval(() => {
        countdown--;
        updateEmergencyCountdown(countdown);

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            executeEmergencyActions();
        }
    }, 1000);

    // Store interval ID for cancellation
    window.emergencyCountdownInterval = countdownInterval;
}

async function executeEmergencyActions() {
    console.log('Executing emergency actions...');

    try {
        // 1. Get current location
        const location = await getCurrentLocation();

        // 2. Call emergency contacts
        await callEmergencyContacts(location);

        // 3. Send notifications
        await sendEmergencyNotifications(location);

        // 4. Activate all safety features
        activateAllSafetyFeatures();

        // 5. Log emergency event
        await logEmergencyEvent('voice_activated', location);

        console.log('Emergency actions completed');
        showToast('Emergency contacts alerted!', 'success');

    } catch (error) {
        console.error('Error executing emergency actions:', error);
        showToast('Error alerting contacts', 'error');
    }
}

async function callEmergencyContacts(location) {
    if (!emergencyContacts || emergencyContacts.length === 0) {
        console.warn('No emergency contacts configured');
        showToast('No emergency contacts to call', 'error');
        return;
    }

    console.log(`Calling ${emergencyContacts.length} emergency contacts...`);

    // In a real implementation, this would:
    // 1. Send SMS with location to all contacts
    // 2. Make automated calls
    // 3. Send push notifications

    // For now, we'll show the emergency contact list
    showEmergencyContactsList(location);

    // Try to initiate call to first contact
    if (emergencyContacts[0]) {
        const firstContact = emergencyContacts[0];
        console.log(`Initiating call to: ${firstContact.name} (${firstContact.phone})`);

        // This will open the phone dialer
        window.location.href = `tel:${firstContact.phone}`;
    }
}

async function sendEmergencyNotifications(location) {
    // Send browser notification
    if (notificationPermission) {
        showNotification(
            '🚨 Emergency Alert Activated',
            'Emergency contacts are being notified with your location.',
            'error'
        );
    }

    // In production, this would send:
    // - SMS to all emergency contacts
    // - Email notifications
    // - Push notifications to contacts' devices
    // - WhatsApp messages (if integrated)
}

function activateAllSafetyFeatures() {
    // Activate safety mode if not already active
    const safetyToggle = document.getElementById('safetyModeToggle');
    if (safetyToggle && !safetyToggle.checked) {
        safetyToggle.checked = true;
        safetyToggle.dispatchEvent(new Event('change'));
    }

    // Enable location sharing
    const locationToggle = document.getElementById('locationSharingToggle');
    if (locationToggle && !locationToggle.checked) {
        locationToggle.checked = true;
        locationToggle.dispatchEvent(new Event('change'));
    }

    console.log('All safety features activated');
}

async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp)
                });
            },
            (error) => {
                console.error('Error getting location:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// ===================================
// UI UPDATES
// ===================================

function updateVoiceCommandUI() {
    const statusElement = document.getElementById('voiceCommandStatus');
    const toggleElement = document.getElementById('voiceCommandToggle');
    const listeningIndicator = document.getElementById('voiceListeningIndicator');

    if (statusElement) {
        if (voiceRecognition.isListening) {
            statusElement.textContent = 'Listening...';
            statusElement.style.color = '#43e97b';
        } else if (voiceRecognition.enabled) {
            statusElement.textContent = 'Active';
            statusElement.style.color = '#4facfe';
        } else {
            statusElement.textContent = 'Inactive';
            statusElement.style.color = 'var(--text-secondary)';
        }
    }

    if (toggleElement) {
        toggleElement.checked = voiceRecognition.enabled;
    }

    if (listeningIndicator) {
        if (voiceRecognition.isListening) {
            listeningIndicator.classList.remove('hidden');
        } else {
            listeningIndicator.classList.add('hidden');
        }
    }
}

function updateLanguageUI() {
    const languageDisplay = document.getElementById('currentVoiceLanguage');
    const languageSelect = document.getElementById('voiceLanguageSelect');

    if (languageDisplay) {
        languageDisplay.textContent = LANGUAGE_NAMES[voiceRecognition.language];
    }

    if (languageSelect) {
        languageSelect.value = voiceRecognition.language;
    }

    // Update keywords list
    if (typeof updateKeywordsUI === 'function') {
        updateKeywordsUI();
    }
}

function showHelpCommandAlert(transcript, confidence) {
    // Create alert banner
    const alertBanner = document.createElement('div');
    alertBanner.className = 'voice-alert-banner';
    alertBanner.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">🎤</div>
            <div class="alert-text">
                <strong>Voice Command Detected!</strong>
                <p>"${transcript}" (${Math.round(confidence * 100)}% confidence)</p>
            </div>
        </div>
    `;

    document.body.appendChild(alertBanner);

    // Remove after 3 seconds
    setTimeout(() => {
        alertBanner.remove();
    }, 3000);
}

function showEmergencyActivationModal() {
    let modal = document.getElementById('emergencyActivationModal');

    if (!modal) {
        modal = createEmergencyActivationModal();
        document.body.appendChild(modal);
    }

    // Reset countdown
    updateEmergencyCountdown(5);

    // Show modal
    modal.classList.remove('hidden');

    // Setup cancel button
    const cancelBtn = modal.querySelector('#cancelEmergencyActivation');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            clearInterval(window.emergencyCountdownInterval);
            modal.classList.add('hidden');
            showToast('Emergency activation cancelled', 'info');
        };
    }
}

function createEmergencyActivationModal() {
    const modal = document.createElement('div');
    modal.id = 'emergencyActivationModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content emergency-activation">
            <div class="modal-header emergency">
                <h2>🚨 Emergency Protocol Activated</h2>
            </div>
            <div class="modal-body">
                <div class="emergency-icon pulsing">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3>Emergency Contacts Will Be Alerted</h3>
                <div class="countdown-display">
                    <div class="countdown-number" id="emergencyCountdownNumber">5</div>
                    <p>seconds to cancel</p>
                </div>
                <p class="emergency-message">Your location and emergency alert will be sent to all emergency contacts.</p>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn large" id="cancelEmergencyActivation">Cancel</button>
            </div>
        </div>
    `;

    return modal;
}

function updateEmergencyCountdown(seconds) {
    const countdownElement = document.getElementById('emergencyCountdownNumber');
    if (countdownElement) {
        countdownElement.textContent = seconds;

        if (seconds <= 0) {
            countdownElement.textContent = '0';
        }
    }
}

function showEmergencyContactsList(location) {
    // This would show a list of contacts being alerted
    // For now, just log
    console.log('Emergency contacts being alerted:', emergencyContacts);

    if (location) {
        console.log('Location being sent:', location);
    }
}

// ===================================
// DATA PERSISTENCE
// ===================================

async function saveVoiceSettings() {
    if (!currentUser || !db) return;

    try {
        const settings = {
            enabled: voiceRecognition.enabled,
            language: voiceRecognition.language,
            confidenceThreshold: voiceRecognition.confidenceThreshold,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(currentUser.uid).update({
            voiceCommandSettings: settings
        });

        console.log('Voice settings saved');
    } catch (error) {
        console.error('Error saving voice settings:', error);
    }
}

async function loadVoiceSettings() {
    if (!currentUser || !db) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            if (userData.voiceCommandSettings) {
                const settings = userData.voiceCommandSettings;

                voiceRecognition.language = settings.language || 'en-IN';
                voiceRecognition.confidenceThreshold = settings.confidenceThreshold || 0.6;

                // Update UI
                updateLanguageUI();

                console.log('Voice settings loaded');
            }
        }
    } catch (error) {
        console.error('Error loading voice settings:', error);
    }
}

async function logVoiceCommand(transcript, confidence) {
    if (!currentUser || !db) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('voiceCommandHistory')
            .add({
                transcript: transcript,
                confidence: confidence,
                language: voiceRecognition.language,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                action: 'help_command_detected'
            });
    } catch (error) {
        console.error('Error logging voice command:', error);
    }
}

async function logEmergencyEvent(trigger, location) {
    if (!currentUser || !db) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('emergencyEvents')
            .add({
                trigger: trigger,
                location: location,
                voiceCommand: voiceRecognition.lastCommand,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                contactsAlerted: emergencyContacts.length
            });
    } catch (error) {
        console.error('Error logging emergency event:', error);
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function getSupportedLanguages() {
    return voiceRecognition.supportedLanguages.map(code => ({
        code: code,
        name: LANGUAGE_NAMES[code],
        keywords: HELP_KEYWORDS[code]
    }));
}

function getHelpKeywordsForLanguage(languageCode) {
    return HELP_KEYWORDS[languageCode] || [];
}

function updateKeywordsUI() {
    const keywordsList = document.getElementById('keywordsList');
    if (!keywordsList) return;

    const keywords = HELP_KEYWORDS[voiceRecognition.language] || [];

    keywordsList.innerHTML = keywords.map(keyword =>
        `<span class="keyword-badge">${keyword}</span>`
    ).join('');
}

// ===================================
// EXPORT FUNCTIONS
// ===================================

// Make functions globally available
window.initializeVoiceCommands = initializeVoiceCommands;
window.startVoiceCommands = startVoiceCommands;
window.stopVoiceCommands = stopVoiceCommands;
window.changeVoiceLanguage = changeVoiceLanguage;
window.getSupportedLanguages = getSupportedLanguages;
window.getHelpKeywordsForLanguage = getHelpKeywordsForLanguage;
window.voiceRecognition = voiceRecognition;

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVoiceCommands);
} else {
    initializeVoiceCommands();
}

console.log('Multilingual voice commands module loaded');
console.log(`Supported languages: ${Object.keys(HELP_KEYWORDS).length}`);
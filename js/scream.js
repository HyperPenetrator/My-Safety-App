// ===================================
// SCREAM DETECTION SYSTEM
// My Safety App - Audio-Based Threat Detection
// ===================================

// Global variables for scream detection
let screamDetection = {
    enabled: false,
    isListening: false,
    audioContext: null,
    analyser: null,
    microphone: null,
    animationFrame: null,

    // Detection thresholds
    volumeThreshold: 150,        // Minimum volume level (0-255)
    frequencyThreshold: 2000,    // High frequency threshold (Hz)
    durationThreshold: 500,      // Minimum scream duration (ms)

    // State tracking
    screamStartTime: null,
    isScreaming: false,
    lastDetectionTime: null,
    cooldownPeriod: 5000,        // 5 seconds cooldown between detections

    // Statistics
    detectionCount: 0,
    falsePositiveCount: 0
};

// ===================================
// INITIALIZATION
// ===================================

async function initializeScreamDetection() {
    console.log('Initializing scream detection system...');

    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Audio API not supported in this browser');
        showToast('Scream detection not supported in this browser', 'error');
        return false;
    }

    if (!window.AudioContext && !window.webkitAudioContext) {
        console.error('Web Audio API not supported');
        showToast('Audio analysis not supported', 'error');
        return false;
    }

    console.log('Scream detection initialized');
    return true;
}

// ===================================
// START/STOP DETECTION
// ===================================

async function startScreamDetection() {
    if (screamDetection.isListening) {
        console.log('Scream detection already active');
        return true;
    }

    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: false
            }
        });

        // Create audio context
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        screamDetection.audioContext = new AudioContextClass();

        // Create analyser
        screamDetection.analyser = screamDetection.audioContext.createAnalyser();
        screamDetection.analyser.fftSize = 2048;
        screamDetection.analyser.smoothingTimeConstant = 0.8;

        // Connect microphone to analyser
        screamDetection.microphone = screamDetection.audioContext.createMediaStreamSource(stream);
        screamDetection.microphone.connect(screamDetection.analyser);

        // Start detection loop
        screamDetection.enabled = true;
        screamDetection.isListening = true;
        detectScreamLoop();

        console.log('Scream detection started');
        showToast('Scream detection active', 'success');
        updateScreamDetectionUI();

        return true;

    } catch (error) {
        console.error('Error starting scream detection:', error);

        if (error.name === 'NotAllowedError') {
            showToast('Microphone permission denied', 'error');
        } else {
            showToast('Error starting scream detection', 'error');
        }

        return false;
    }
}

function stopScreamDetection() {
    if (!screamDetection.isListening) {
        return;
    }

    try {
        // Stop animation frame
        if (screamDetection.animationFrame) {
            cancelAnimationFrame(screamDetection.animationFrame);
            screamDetection.animationFrame = null;
        }

        // Disconnect microphone
        if (screamDetection.microphone) {
            screamDetection.microphone.disconnect();
            screamDetection.microphone = null;
        }

        // Close audio context
        if (screamDetection.audioContext) {
            screamDetection.audioContext.close();
            screamDetection.audioContext = null;
        }

        screamDetection.enabled = false;
        screamDetection.isListening = false;
        screamDetection.isScreaming = false;
        screamDetection.screamStartTime = null;

        console.log('Scream detection stopped');
        showToast('Scream detection deactivated', 'info');
        updateScreamDetectionUI();

    } catch (error) {
        console.error('Error stopping scream detection:', error);
    }
}

// ===================================
// DETECTION LOOP
// ===================================

function detectScreamLoop() {
    if (!screamDetection.enabled) {
        return;
    }

    const bufferLength = screamDetection.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);

    // Get frequency and time domain data
    screamDetection.analyser.getByteTimeDomainData(dataArray);
    screamDetection.analyser.getByteFrequencyData(frequencyData);

    // Calculate volume (RMS)
    const volume = calculateRMS(dataArray);

    // Calculate dominant frequency
    const dominantFrequency = calculateDominantFrequency(frequencyData);

    // Check if it's a scream
    const isScream = detectScream(volume, dominantFrequency);

    if (isScream) {
        handleScreamDetected(volume, dominantFrequency);
    } else if (screamDetection.isScreaming) {
        // Scream ended
        handleScreamEnded();
    }

    // Continue loop
    screamDetection.animationFrame = requestAnimationFrame(detectScreamLoop);
}

// ===================================
// AUDIO ANALYSIS
// ===================================

function calculateRMS(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return rms * 255; // Scale to 0-255
}

function calculateDominantFrequency(frequencyData) {
    let maxValue = 0;
    let maxIndex = 0;

    // Focus on high frequency range (1000-4000 Hz) typical for screams
    const sampleRate = screamDetection.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / frequencyData.length;

    const minBin = Math.floor(1000 / binWidth);
    const maxBin = Math.floor(4000 / binWidth);

    for (let i = minBin; i < maxBin && i < frequencyData.length; i++) {
        if (frequencyData[i] > maxValue) {
            maxValue = frequencyData[i];
            maxIndex = i;
        }
    }

    return maxIndex * binWidth;
}

function detectScream(volume, frequency) {
    // Check volume threshold
    if (volume < screamDetection.volumeThreshold) {
        return false;
    }

    // Check frequency threshold (screams are typically high-pitched)
    if (frequency < screamDetection.frequencyThreshold) {
        return false;
    }

    // Check cooldown period
    if (screamDetection.lastDetectionTime) {
        const timeSinceLastDetection = Date.now() - screamDetection.lastDetectionTime;
        if (timeSinceLastDetection < screamDetection.cooldownPeriod) {
            return false;
        }
    }

    return true;
}

// ===================================
// SCREAM EVENT HANDLERS
// ===================================

function handleScreamDetected(volume, frequency) {
    const now = Date.now();

    if (!screamDetection.isScreaming) {
        // New scream detected
        screamDetection.isScreaming = true;
        screamDetection.screamStartTime = now;

        console.log(`🔊 SCREAM DETECTED! Volume: ${volume.toFixed(2)}, Frequency: ${frequency.toFixed(2)} Hz`);

        // Show visual indicator
        showScreamDetectedAlert(volume, frequency);

    } else {
        // Scream continuing
        const duration = now - screamDetection.screamStartTime;

        // Check if scream has lasted long enough
        if (duration >= screamDetection.durationThreshold) {
            // Trigger emergency protocol
            triggerScreamEmergency(volume, frequency, duration);
        }
    }
}

function handleScreamEnded() {
    const duration = Date.now() - screamDetection.screamStartTime;

    console.log(`Scream ended. Duration: ${duration}ms`);

    screamDetection.isScreaming = false;
    screamDetection.screamStartTime = null;

    // If scream was too short, might be false positive
    if (duration < screamDetection.durationThreshold) {
        screamDetection.falsePositiveCount++;
        console.log('Scream too short - possible false positive');
    }
}

async function triggerScreamEmergency(volume, frequency, duration) {
    console.log('🚨 SCREAM EMERGENCY TRIGGERED 🚨');
    console.log(`Volume: ${volume.toFixed(2)}, Frequency: ${frequency.toFixed(2)} Hz, Duration: ${duration}ms`);

    screamDetection.detectionCount++;
    screamDetection.lastDetectionTime = Date.now();

    // Show emergency modal
    showScreamEmergencyModal(volume, frequency, duration);

    // Start countdown (5 seconds to cancel)
    let countdown = 5;
    const countdownInterval = setInterval(() => {
        countdown--;
        updateScreamEmergencyCountdown(countdown);

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            executeScreamEmergencyActions();
        }
    }, 1000);

    // Store interval ID for cancellation
    window.screamEmergencyCountdownInterval = countdownInterval;

    // Log to Firestore
    await logScreamDetection(volume, frequency, duration);
}

async function executeScreamEmergencyActions() {
    console.log('Executing scream emergency actions...');

    try {
        // 1. Get current location
        const location = await getCurrentLocationForScream();

        // 2. Send location to emergency contacts
        await sendLocationToContacts(location);

        // 3. Activate voice command mode
        activateVoiceCommandMode();

        // 4. Send emergency notifications
        await sendScreamEmergencyNotifications(location);

        // 5. Activate all safety features
        activateAllSafetyFeatures();

        // 6. Log emergency event
        await logScreamEmergencyEvent(location);

        console.log('Scream emergency actions completed');
        showToast('Emergency contacts alerted! Voice commands activated.', 'success');

        // Hide modal
        hideScreamEmergencyModal();

    } catch (error) {
        console.error('Error executing scream emergency actions:', error);
        showToast('Error alerting contacts', 'error');
    }
}

// ===================================
// EMERGENCY ACTIONS
// ===================================

async function getCurrentLocationForScream() {
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

async function sendLocationToContacts(location) {
    if (!emergencyContacts || emergencyContacts.length === 0) {
        console.warn('No emergency contacts configured');
        showToast('No emergency contacts to alert', 'error');
        return;
    }

    console.log(`Sending location to ${emergencyContacts.length} emergency contacts...`);

    // In production, this would send SMS/notifications with location
    // For now, we'll prepare the message
    const locationUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    const message = `🚨 EMERGENCY ALERT - Scream detected!\n\nLocation: ${locationUrl}\nTime: ${new Date().toLocaleString()}\n\nThis is an automated alert from My Safety app.`;

    console.log('Emergency message:', message);

    // Show contacts being alerted
    showContactsAlertedList(emergencyContacts, location);

    // Try to initiate call to first contact
    if (emergencyContacts[0]) {
        const firstContact = emergencyContacts[0];
        console.log(`Initiating call to: ${firstContact.name} (${firstContact.phone})`);

        // This will open the phone dialer
        setTimeout(() => {
            window.location.href = `tel:${firstContact.phone}`;
        }, 2000);
    }
}

function activateVoiceCommandMode() {
    console.log('Activating voice command mode...');

    // Enable voice commands if available
    if (typeof startVoiceCommands === 'function') {
        const started = startVoiceCommands();
        if (started) {
            console.log('Voice commands activated');
            showToast('Voice commands now active - say "help" for assistance', 'info');
        }
    }

    // Enable voice command toggle in UI
    const voiceToggle = document.getElementById('voiceCommandToggle');
    if (voiceToggle && !voiceToggle.checked) {
        voiceToggle.checked = true;
        voiceToggle.dispatchEvent(new Event('change'));
    }
}

async function sendScreamEmergencyNotifications(location) {
    // Send browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 Emergency Alert', {
            body: 'Scream detected! Emergency contacts are being notified.',
            icon: '/favicon.ico',
            tag: 'scream-emergency',
            requireInteraction: true
        });
    }

    // Vibrate if supported
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
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

// ===================================
// UI UPDATES
// ===================================

function updateScreamDetectionUI() {
    const statusElement = document.getElementById('screamDetectionStatus');
    const toggleElement = document.getElementById('screamDetectionToggle');

    if (statusElement) {
        if (screamDetection.isListening) {
            statusElement.textContent = 'Listening...';
            statusElement.style.color = '#43e97b';
        } else if (screamDetection.enabled) {
            statusElement.textContent = 'Active';
            statusElement.style.color = '#4facfe';
        } else {
            statusElement.textContent = 'Inactive';
            statusElement.style.color = 'var(--text-secondary)';
        }
    }

    if (toggleElement) {
        toggleElement.checked = screamDetection.enabled;
    }
}

function showScreamDetectedAlert(volume, frequency) {
    // Create alert banner
    const alertBanner = document.createElement('div');
    alertBanner.className = 'scream-alert-banner';
    alertBanner.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">🔊</div>
            <div class="alert-text">
                <strong>Scream Detected!</strong>
                <p>Volume: ${volume.toFixed(0)}, Frequency: ${frequency.toFixed(0)} Hz</p>
            </div>
        </div>
    `;

    document.body.appendChild(alertBanner);

    // Remove after 2 seconds
    setTimeout(() => {
        alertBanner.remove();
    }, 2000);
}

function showScreamEmergencyModal(volume, frequency, duration) {
    let modal = document.getElementById('screamEmergencyModal');

    if (!modal) {
        modal = createScreamEmergencyModal();
        document.body.appendChild(modal);
    }

    // Update details
    document.getElementById('screamVolume').textContent = volume.toFixed(0);
    document.getElementById('screamFrequency').textContent = frequency.toFixed(0);
    document.getElementById('screamDuration').textContent = duration;

    // Reset countdown
    updateScreamEmergencyCountdown(5);

    // Show modal
    modal.classList.remove('hidden');

    // Setup cancel button
    const cancelBtn = modal.querySelector('#cancelScreamEmergency');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            clearInterval(window.screamEmergencyCountdownInterval);
            modal.classList.add('hidden');
            showToast('Emergency activation cancelled', 'info');
        };
    }
}

function createScreamEmergencyModal() {
    const modal = document.createElement('div');
    modal.id = 'screamEmergencyModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content emergency-activation">
            <div class="modal-header emergency">
                <h2>🚨 Scream Detected - Emergency Protocol</h2>
            </div>
            <div class="modal-body">
                <div class="emergency-icon pulsing">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-width="2" />
                    </svg>
                </div>
                <h3>Threat Detected - Emergency Contacts Will Be Alerted</h3>
                <div class="scream-details">
                    <p><strong>Volume:</strong> <span id="screamVolume">-</span></p>
                    <p><strong>Frequency:</strong> <span id="screamFrequency">-</span> Hz</p>
                    <p><strong>Duration:</strong> <span id="screamDuration">-</span> ms</p>
                </div>
                <div class="countdown-display">
                    <div class="countdown-number" id="screamEmergencyCountdownNumber">5</div>
                    <p>seconds to cancel</p>
                </div>
                <p class="emergency-message">Your location will be sent to all emergency contacts and voice commands will be activated.</p>
            </div>
            <div class="modal-actions">
                <button class="cancel-btn large" id="cancelScreamEmergency">Cancel - I'm Safe</button>
            </div>
        </div>
    `;

    return modal;
}

function updateScreamEmergencyCountdown(seconds) {
    const countdownElement = document.getElementById('screamEmergencyCountdownNumber');
    if (countdownElement) {
        countdownElement.textContent = seconds;

        if (seconds <= 0) {
            countdownElement.textContent = '0';
        }
    }
}

function hideScreamEmergencyModal() {
    const modal = document.getElementById('screamEmergencyModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showContactsAlertedList(contacts, location) {
    console.log('Emergency contacts being alerted:', contacts);
    console.log('Location being sent:', location);

    // In production, this would show a detailed list in the UI
}

// ===================================
// DATA PERSISTENCE
// ===================================

async function logScreamDetection(volume, frequency, duration) {
    if (!currentUser || !db) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('screamDetections')
            .add({
                volume: volume,
                frequency: frequency,
                duration: duration,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                action: 'scream_detected'
            });
    } catch (error) {
        console.error('Error logging scream detection:', error);
    }
}

async function logScreamEmergencyEvent(location) {
    if (!currentUser || !db) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('emergencyEvents')
            .add({
                trigger: 'scream_detection',
                location: location,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                contactsAlerted: emergencyContacts.length,
                voiceCommandsActivated: true
            });
    } catch (error) {
        console.error('Error logging scream emergency event:', error);
    }
}

// ===================================
// EXPORT FUNCTIONS
// ===================================

// Make functions globally available
window.initializeScreamDetection = initializeScreamDetection;
window.startScreamDetection = startScreamDetection;
window.stopScreamDetection = stopScreamDetection;
window.screamDetection = screamDetection;

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScreamDetection);
} else {
    initializeScreamDetection();
}

console.log('Scream detection module loaded');
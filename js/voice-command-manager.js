class VoiceCommandManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isEnabled = false;
        // Support for Chrome and standard browsers
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    }

    isSupported() {
        return !!this.SpeechRecognition;
    }

    init() {
        if (!this.isSupported()) {
            console.warn('Voice recognition not supported');
            return;
        }

        this.recognition = new this.SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US'; // Default to English

        this.recognition.onstart = () => {
            console.log('Voice monitoring active...');
            this.updateIndicator('Listening...', 'active');
        };

        this.recognition.onerror = (event) => {
            console.error('Voice error:', event.error);
            if (event.error === 'not-allowed') {
                this.stop();
                alert('Microphone access denied. Please enable permission.');
            } else {
                // Restart if it crashes (unless manually stopped)
                if (this.isEnabled) this.restart();
            }
        };

        this.recognition.onend = () => {
            if (this.isEnabled) {
                console.log('Voice service stopped, restarting...');
                this.restart();
            } else {
                this.updateIndicator('Voice Control Off', 'inactive');
            }
        };

        this.recognition.onresult = (event) => {
            const lastv = event.results.length - 1;
            const command = event.results[lastv][0].transcript.trim().toLowerCase();
            console.log('Heard:', command);

            this.processCommand(command);
        };
    }

    processCommand(command) {
        // Trigger words list
        const triggers = ['help', 'save me', 'emergency', 'bachao', 'stop', 'alert'];

        if (triggers.some(trigger => command.includes(trigger))) {
            console.log('🚨 EMERGENCY COMMAND DETECTED:', command);
            this.triggerEmergency();
        }
    }

    triggerEmergency() {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // Trigger Call System
        if (window.emergencyCallSystem) {
            window.emergencyCallSystem.startEmergencySequence();
        } else {
            alert('Emergency System not ready!');
        }
    }

    toggle(enable) {
        this.isEnabled = enable;
        if (enable) {
            this.start();
        } else {
            this.stop();
        }
        localStorage.setItem('voice_commands_enabled', enable);
    }

    start() {
        if (!this.recognition) this.init();
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
            } catch (e) {
                console.log('Already started');
            }
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    restart() {
        setTimeout(() => this.start(), 1000);
    }

    updateIndicator(text, status) {
        const indicator = document.getElementById('voiceStatusIndicator');
        if (indicator) {
            indicator.textContent = text;
            indicator.className = `voice-indicator ${status}`;
        }
    }
}

// Global Instance
window.voiceManager = new VoiceCommandManager();

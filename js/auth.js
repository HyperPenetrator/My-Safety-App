// ===================================
// AUTHENTICATION LOGIC - SAFETY APP
// ===================================

// Initialize Firebase (will use config from firebase-config.js)
let auth;
let db;

// Wait for Firebase to be initialized
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
    } else {
        console.error('Firebase not initialized. Please check firebase-config.js');
        showToast('Configuration error. Please contact support.', 'error');
    }

    initializeAuthPage();
});

// ===================================
// PAGE INITIALIZATION
// ===================================

function initializeAuthPage() {
    setupToggleButtons();
    setupGoogleAuth();
    setupEmailAuth();
    checkAuthState();
}

// ===================================
// TOGGLE BETWEEN LOGIN & REGISTER
// ===================================

function setupToggleButtons() {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authToggle = document.querySelector('.auth-toggle');

    loginToggle.addEventListener('click', () => {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authToggle.classList.remove('register-active');
    });

    registerToggle.addEventListener('click', () => {
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        authToggle.classList.add('register-active');
    });
}

// ===================================
// GOOGLE AUTHENTICATION
// ===================================

function setupGoogleAuth() {
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }

    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', handleGoogleSignUp);
    }
}

async function handleGoogleSignIn() {
    showLoading();

    try {
        // 1. Set persistence to LOCAL (Explicitly ensure "Remember Me")
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        // 2. Configure Provider
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        // 3. SignIn
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('Google Sign-In successful:', user.email);

        // 4. Check & Create/Update User
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            await handleSuccessfulLogin(user);
        } else {
            // Auto-create account for Google users (better UX than error)
            await createUserProfile(user, {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                authProvider: 'google'
            });
            await handleSuccessfulRegistration(user);
        }
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

async function handleGoogleSignUp() {
    showLoading();

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        console.log('Google Sign-Up successful:', user.email);

        // Check if user already exists
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            // User already exists - proceed to dashboard
            await handleSuccessfulLogin(user);
        } else {
            // New user - create user profile
            await createUserProfile(user, {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                authProvider: 'google'
            });

            await handleSuccessfulRegistration(user);
        }
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// ===================================
// EMAIL/PASSWORD AUTHENTICATION
// ===================================

function setupEmailAuth() {
    const emailLoginForm = document.getElementById('emailLoginForm');
    const emailRegisterForm = document.getElementById('emailRegisterForm');
    const registerPassword = document.getElementById('registerPassword');

    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', handleEmailLogin);
    }

    if (emailRegisterForm) {
        emailRegisterForm.addEventListener('submit', handleEmailRegister);
    }

    // Password strength indicator
    if (registerPassword) {
        registerPassword.addEventListener('input', updatePasswordStrength);
    }
}

async function handleEmailLogin(e) {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;

        console.log('Email login successful:', user.email);
        await handleSuccessfulLogin(user);
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

async function handleEmailRegister(e) {
    e.preventDefault();
    showLoading();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    if (!agreeTerms) {
        hideLoading();
        showToast('Please agree to the Terms & Conditions', 'error');
        return;
    }

    if (password.length < 6) {
        hideLoading();
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;

        // Update user profile
        await user.updateProfile({
            displayName: name
        });

        // Create user document in Firestore
        await createUserProfile(user, {
            name: name,
            email: email,
            phone: phone,
            authProvider: 'email'
        });

        console.log('Email registration successful:', user.email);
        await handleSuccessfulRegistration(user);
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// ===================================
// USER PROFILE MANAGEMENT
// ===================================

async function createUserProfile(user, additionalData) {
    try {
        const userProfile = {
            uid: user.uid,
            email: user.email,
            name: additionalData.name || user.displayName || '',
            phone: additionalData.phone || '',
            photoURL: additionalData.photoURL || user.photoURL || '',
            authProvider: additionalData.authProvider || 'email',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            // Safety app specific fields
            emergencyContacts: [],
            safetyMode: {
                enabled: false,
                voiceCommandsEnabled: false,
                screamDetectionEnabled: false
            },
            settings: {
                notifications: true,
                locationSharing: false,
                batteryAlerts: true
            }
        };

        await db.collection('users').doc(user.uid).set(userProfile);
        console.log('User profile created successfully');
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

async function updateLastLogin(userId) {
    try {
        await db.collection('users').doc(userId).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating last login:', error);
    }
}

// ===================================
// AUTH STATE MANAGEMENT
// ===================================

function checkAuthState() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User is signed in:', user.email);
            // User is already logged in, redirect to dashboard
            // Uncomment the line below when ready to auto-redirect
            // window.location.href = 'dashboard.html';
        } else {
            console.log('No user signed in');
        }
    });
}

async function handleSuccessfulLogin(user) {
    try {
        await updateLastLogin(user.uid);
        showSuccess();

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Error in post-login process:', error);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

async function handleSuccessfulRegistration(user) {
    showSuccess();

    // Send email verification
    try {
        await user.sendEmailVerification();
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }

    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// ===================================
// PASSWORD STRENGTH INDICATOR
// ===================================

function updatePasswordStrength(e) {
    const password = e.target.value;
    const strengthIndicator = document.getElementById('passwordStrength');

    if (!strengthIndicator) return;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    // Update UI
    strengthIndicator.classList.remove('weak', 'medium', 'strong');

    if (strength <= 2) {
        strengthIndicator.classList.add('weak');
    } else if (strength <= 4) {
        strengthIndicator.classList.add('medium');
    } else {
        strengthIndicator.classList.add('strong');
    }
}

// ===================================
// ERROR HANDLING
// ===================================

function handleAuthError(error) {
    console.error('Authentication error:', error);

    let message = 'An error occurred. Please try again.';

    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'This email is already registered. Please sign in instead.';
            break;
        case 'auth/invalid-email':
            message = 'Invalid email address.';
            break;
        case 'auth/operation-not-allowed':
            message = 'This sign-in method is not enabled.';
            break;
        case 'auth/weak-password':
            message = 'Password is too weak. Use at least 6 characters.';
            break;
        case 'auth/user-disabled':
            message = 'This account has been disabled.';
            break;
        case 'auth/user-not-found':
            message = 'No account found with this email.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
        case 'auth/popup-closed-by-user':
            message = 'Sign-in cancelled.';
            break;
        case 'auth/cancelled-popup-request':
            message = 'Only one popup request is allowed at a time.';
            break;
        case 'auth/network-request-failed':
            message = 'Network error. Please check your connection.';
            break;
        default:
            message = error.message || 'An unexpected error occurred.';
    }

    showToast(message, 'error');
}

// ===================================
// UI HELPERS
// ===================================

function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

function showSuccess() {
    hideLoading();
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.classList.remove('hidden');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    // Set message
    toastMessage.textContent = message;

    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    toastIcon.textContent = icons[type] || icons.info;

    // Set type class
    toast.classList.remove('success', 'error', 'info');
    toast.classList.add(type);

    // Show toast
    toast.classList.remove('hidden');

    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Sign out function (can be used elsewhere)
async function signOut() {
    try {
        await auth.signOut();
        console.log('User signed out successfully');
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showToast('Error signing out', 'error');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { signOut };
}

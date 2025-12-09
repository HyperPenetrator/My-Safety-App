// ===================================
// FIREBASE CONFIGURATION
// ===================================
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWJBPVodBfR7h7x7nMY0ZxGnt7f6tIoaU",
    authDomain: "my-safety-e362d.firebaseapp.com",
    projectId: "my-safety-e362d",
    storageBucket: "my-safety-e362d.firebasestorage.app",
    messagingSenderId: "286418003868",
    appId: "1:286418003868:web:39eb14fe3e5f92f20f8a59",
    measurementId: "G-2S5QVZEQR0"
};

// Initialize Firebase (using compat version loaded in HTML)
let app;
try {
    app = firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Failed to initialize Firebase. Please check your configuration.');
}
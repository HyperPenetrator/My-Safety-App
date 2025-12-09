// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAWJBPVodBfR7h7x7nMY0ZxGnt7f6tIoaU",
    authDomain: "my-safety-e362d.firebaseapp.com",
    projectId: "my-safety-e362d",
    storageBucket: "my-safety-e362d.firebasestorage.app",
    messagingSenderId: "286418003868",
    appId: "1:286418003868:web:39eb14fe3e5f92f20f8a59",
    measurementId: "G-2S5QVZEQR0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
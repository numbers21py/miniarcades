// Firebase Configuration
// IMPORTANT: Replace with your own Firebase config after creating a project

const firebaseConfig = {
    // Placeholder - user needs to create Firebase project and get config
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};

// Initialize Firebase (will be called when user adds their config)
let app, database, auth;

if (typeof firebase !== 'undefined' && isFirebaseConfigured()) {
    try {
        app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        auth = firebase.auth();
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.warn('⚠️ Firebase initialization failed:', error);
    }
} else {
    console.warn('⚠️ Firebase not configured. Using LocalStorage mode.');
}


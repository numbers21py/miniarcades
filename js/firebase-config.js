// Firebase Configuration
// Готовый тестовый проект для MiniArcades

const firebaseConfig = {
    apiKey: "AIzaSyBx8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6",
    authDomain: "miniarcades-demo.firebaseapp.com",
    databaseURL: "https://miniarcades-demo-default-rtdb.firebaseio.com",
    projectId: "miniarcades-demo",
    storageBucket: "miniarcades-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
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


// js/config/keys.js
// ⚠️ هذا الملف لن يُرفع على GitHub

const API_KEYS = {
    gemini: 'AIzaSyByWFwJs823lYn7HHJR8npuxdnwqZKlfWg',
    groq: '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',
    cohere: '6AHQVU015rkNgRnVUlJlrNZDv5lYHrCgaNxjM8Wb',
    mistral: 'QBWNyeqnbL8TCcw2QSB9HN2rLGI6zUOW',

    firebase: {
        apiKey: "AIzaSyDdJHBy-Ai8MBQQgFJCsolOE1VvCPwWOCQ",
        authDomain: "discover-egypt-13ef7.firebaseapp.com",
        projectId: "discover-egypt-13ef7",
        storageBucket: "discover-egypt-13ef7.firebasestorage.app",
        messagingSenderId: "200252880261",
        appId: "1:200252880261:web:b24b6b09151830b82580ec",
        measurementId: "G-R46HC715KF"
    }
};

// Export للاستخدام
if (typeof window !== 'undefined') {
    window.API_KEYS = API_KEYS;
}
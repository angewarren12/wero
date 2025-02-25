// Détecter si nous sommes en production (Vercel) ou en local
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

// Configuration de l'API
const config = {
    apiUrl: isProduction ? '/api' : 'http://localhost:3000/api'
};

export default config;

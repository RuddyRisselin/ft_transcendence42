// Configuration des URLs de l'API
const API_CONFIG = {
    // Base URL pour toutes les requêtes API - utilise l'URL actuelle
    API_BASE_URL: '/api',
    
    // URL pour WebSocket sécurisé - utilise l'URL actuelle
    WS_URL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
    
    // Pour le développement local sans HTTPS (à commenter en production)
    // API_BASE_URL: 'http://localhost:3000',
    // WS_URL: 'ws://localhost:3000/ws',
};

export default API_CONFIG; 
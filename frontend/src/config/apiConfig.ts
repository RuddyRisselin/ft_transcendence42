// Configuration des URLs de l'API
const API_CONFIG = {
    // Base URL pour toutes les requêtes API
    API_BASE_URL: '/api',
    
    // WebSocket via Nginx
    // Attention: le chemin doit correspondre exactement à la configuration Nginx (sans slash final)
    WS_URL: 'wss://localhost:4430/ws',
};

console.log('Configuration WebSocket:', API_CONFIG.WS_URL);

export default API_CONFIG; 
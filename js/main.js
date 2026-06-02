/**
 * PUNTO DE ENTRADA PRINCIPAL
 * Inicializador del juego
 */

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌌 MATH UNIVERSE - Iniciando...');
    
    // Inicializar el juego
    initGame();
});

function initGame() {
    // Crear instancia del controlador del juego
    game = new GameController();
    
    console.log('✅ Juego inicializado correctamente');
    console.log('📊 Motor Babylon.js cargado');
    console.log('🎮 Sistema de física activado');
    console.log('🔊 Audio manager disponible');
    console.log('💾 Sistema de almacenamiento listo');
    
    // Setup de eventos globales
    setupGlobalEvents();
}

function setupGlobalEvents() {
    // Capturar tecla ESC para pausa
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (game && (game.gameState === 'playing' || game.gameState === 'paused')) {
                game.togglePause();
            }
        }
    });
    
    // Detectar si el navegador soporta las características necesarias
    checkBrowserSupport();
}

function checkBrowserSupport() {
    const support = {
        webgl: !!document.createElement('canvas').getContext('webgl'),
        localStorage: typeof(Storage) !== 'undefined',
        audioContext: !!(window.AudioContext || window.webkitAudioContext),
        physics: typeof BABYLON !== 'undefined'
    };
    
    console.log('🌐 Soporte del navegador:', support);
    
    if (!support.webgl) {
        console.warn('⚠️ WebGL no soportado. El juego puede no funcionar correctamente.');
    }
    
    return support;
}

// Manejo de errores global
window.addEventListener('error', (event) => {
    console.error('❌ Error:', event.error);
    console.error('Stack:', event.error.stack);
});

// Prevenir que se cierre accidentalmente
window.addEventListener('beforeunload', (event) => {
    if (game && game.gameState === 'playing') {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }
});

// Estadísticas de rendimiento (opcional)
function logPerformance() {
    if (game && game.engine) {
        const fps = game.engine.getFps();
        console.log(`FPS: ${fps.toFixed(2)} | Scene meshes: ${game.scene.meshes.length}`);
    }
}

// Debugging helper
window.DEBUG = {
    addScore: (points) => game && game.addScore(points),
    addStar: () => game && game.addStar(),
    takeDamage: (amount) => game && game.takeDamage(amount),
    nextWorld: () => game && game.nextWorld(),
    setHealth: (h) => game && (game.health = h),
    getStats: () => ({
        score: game?.score,
        stars: game?.stars,
        health: game?.health,
        world: game?.currentWorld,
        difficulty: game?.difficulty
    }),
    showConsole: () => console.log(window.DEBUG)
};

console.log('🎯 Comandos de debugging disponibles: window.DEBUG');

/**
 * SISTEMA DE ALMACENAMIENTO DE DATOS
 * Gestión de puntuaciones y progreso
 */

class StorageManager {
    constructor() {
        this.prefix = 'mathUniverse_';
        this.initStorage();
    }
    
    initStorage() {
        if (!this.get('playerData')) {
            this.set('playerData', {
                totalScore: 0,
                highScores: [],
                unlockedWorlds: [1],
                worldProgress: {},
                achievments: []
            });
        }
    }
    
    // Guardar datos
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
        }
    }
    
    // Obtener datos
    get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('No se pudo leer de localStorage:', e);
            return null;
        }
    }
    
    // Eliminar datos
    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    // Limpiar todo
    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Guardar puntuación
    saveScore(playerName, score, difficulty, world) {
        const playerData = this.get('playerData') || {};
        
        if (!playerData.highScores) {
            playerData.highScores = [];
        }
        
        playerData.highScores.push({
            name: playerName,
            score: score,
            difficulty: difficulty,
            world: world,
            date: new Date().toISOString()
        });
        
        // Ordenar por puntuación
        playerData.highScores.sort((a, b) => b.score - a.score);
        
        // Mantener solo los top 10
        playerData.highScores = playerData.highScores.slice(0, 10);
        
        playerData.totalScore = Math.max(playerData.totalScore, score);
        
        this.set('playerData', playerData);
        return playerData;
    }
    
    // Obtener puntuaciones altas
    getHighScores() {
        const playerData = this.get('playerData');
        return playerData ? playerData.highScores || [] : [];
    }
    
    // Guardar progreso de mundo
    saveWorldProgress(worldNumber, stats) {
        const playerData = this.get('playerData') || {};
        
        if (!playerData.worldProgress) {
            playerData.worldProgress = {};
        }
        
        playerData.worldProgress[`world${worldNumber}`] = {
            completed: true,
            stars: stats.stars || 0,
            score: stats.score || 0,
            bestTime: stats.bestTime || 0,
            attempts: (playerData.worldProgress[`world${worldNumber}`]?.attempts || 0) + 1
        };
        
        // Desbloquear siguiente mundo
        if (!playerData.unlockedWorlds) {
            playerData.unlockedWorlds = [1];
        }
        
        if (worldNumber < 4 && !playerData.unlockedWorlds.includes(worldNumber + 1)) {
            playerData.unlockedWorlds.push(worldNumber + 1);
        }
        
        this.set('playerData', playerData);
        return playerData;
    }
    
    // Obtener progreso de mundo
    getWorldProgress(worldNumber) {
        const playerData = this.get('playerData');
        if (!playerData || !playerData.worldProgress) return null;
        return playerData.worldProgress[`world${worldNumber}`] || null;
    }
    
    // Obtener mundos desbloqueados
    getUnlockedWorlds() {
        const playerData = this.get('playerData');
        return playerData ? playerData.unlockedWorlds || [1] : [1];
    }
    
    // Verificar logro
    unlockAchievment(achievmentId) {
        const playerData = this.get('playerData') || {};
        
        if (!playerData.achievments) {
            playerData.achievments = [];
        }
        
        if (!playerData.achievments.includes(achievmentId)) {
            playerData.achievments.push(achievmentId);
            this.set('playerData', playerData);
            return true;
        }
        return false;
    }
    
    // Obtener logros
    getAchievments() {
        const playerData = this.get('playerData');
        return playerData ? playerData.achievments || [] : [];
    }
    
    // Exportar datos (para backup)
    exportData() {
        return this.get('playerData');
    }
    
    // Importar datos
    importData(data) {
        this.set('playerData', data);
    }
}

// Instancia global
const storage = new StorageManager();

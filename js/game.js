/**
 * CONTROLADOR PRINCIPAL DEL JUEGO
 * Sistema de flujo y gestión de estados
 */

class GameController {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.canvas = null;
        
        this.currentWorld = 1;
        this.difficulty = 'normal';
        this.gameState = 'menu'; // menu, playing, paused, gameOver, victory
        
        this.player = null;
        this.world = null;
        this.score = 0;
        this.stars = 0;
        this.health = 3;
        this.lives = 3;
        this.timeRemaining = 60;
        
        this.particleSystem = null;
        this.visualEffects = null;
        
        this.init();
    }
    
    init() {
        const canvas = document.getElementById('gameCanvas');
        this.canvas = canvas;
        
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupPhysics();
        
        this.particleSystem = new ParticleSystem(this.scene);
        this.visualEffects = new VisualEffects(this.scene);
        
        // Render loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });
        
        // Resize handling
        window.addEventListener('resize', () => this.engine.resize());
        
        console.log('🎮 GameController inicializado');
    }
    
    setupScene() {
        this.scene.clearColor = new BABYLON.Color3(0.05, 0.08, 0.15);
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    }
    
    setupCamera() {
        this.camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 10, 20));
        this.camera.attachControl(this.canvas, true);
        this.camera.inertia = 0.7;
        this.camera.angularSensibility = 500;
        this.camera.speed = 0;
    }
    
    setupLighting() {
        // Luz ambiental
        const ambientLight = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.6;
        
        // Luz principal
        const mainLight = new BABYLON.PointLight('mainLight', new BABYLON.Vector3(10, 20, 10), this.scene);
        mainLight.intensity = 0.8;
        mainLight.range = 100;
        
        // Luz secundaria
        const secondLight = new BABYLON.PointLight('secondLight', new BABYLON.Vector3(-10, 15, -10), this.scene);
        secondLight.intensity = 0.5;
        secondLight.range = 80;
        
        // Luz de ambiente
        const blueLight = new BABYLON.PointLight('blueLight', new BABYLON.Vector3(0, 5, 0), this.scene);
        blueLight.intensity = 0.3;
        blueLight.range = 50;
        blueLight.diffuse = new BABYLON.Color3(0, 0.5, 1);
    }
    
    setupPhysics() {
        this.scene.enablePhysics(
            new BABYLON.Vector3(0, -9.81, 0),
            new BABYLON.CannonJSPlugin()
        );
    }
    
    startGame() {
        this.gameState = 'playing';
        this.loadWorld(this.currentWorld);
        this.updateHUD();
        
        // Iniciar temporizador
        this.startTimer();
    }
    
    loadWorld(worldNumber) {
        // Limpiar mundo anterior
        if (this.world) {
            this.world.dispose();
        }
        
        this.currentWorld = worldNumber;
        
        // Cargar mundo específico
        switch(worldNumber) {
            case 1:
                this.world = new DivisionWorld(this.scene, this.difficulty);
                break;
            case 2:
                this.world = new SumaWorld(this.scene, this.difficulty);
                break;
            case 3:
                this.world = new MultiplicacionWorld(this.scene, this.difficulty);
                break;
            case 4:
                this.world = new TemploWorld(this.scene, this.difficulty);
                break;
        }
        
        this.resetWorldStats();
        this.updateHUD();
    }
    
    resetWorldStats() {
        this.score = 0;
        this.stars = 0;
        this.health = 3;
        this.lives = 3;
        this.timeRemaining = this.difficulty === 'easy' ? 120 : 
                            this.difficulty === 'normal' ? 60 : 30;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateHUD();
            
            if (this.timeRemaining <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    update() {
        if (this.gameState !== 'playing' || !this.world) return;
        
        const deltaTime = this.engine.getDeltaTime() / 1000;
        
        this.world.update(deltaTime);
        this.particleSystem.update(deltaTime);
        
        // Actualizar HUD
        this.updateHUD();
    }
    
    updateHUD() {
        document.getElementById('starCount').textContent = `${this.stars}/3`;
        document.getElementById('healthCount').textContent = this.health;
        
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timeCount').textContent = 
            `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        // Actualizar nombre del mundo
        const worldNames = ['', 'LA DIVISIÓN', 'LA SUMA MÁGICA', 'LA MULTIPLICACIÓN CÓSMICA', 'EL TEMPLO FINAL'];
        document.getElementById('worldName').textContent = worldNames[this.currentWorld] || 'MUNDO';
    }
    
    addScore(points) {
        this.score += Math.floor(points * this.getDifficultyMultiplier());
        audioManager.play('success');
    }
    
    addStar() {
        if (this.stars < 3) {
            this.stars++;
            this.particleSystem.createStarRain(this.camera.position);
            audioManager.play('levelUp');
        }
    }
    
    takeDamage(amount = 1) {
        this.health -= amount;
        this.visualEffects.createFlash();
        audioManager.play('hit');
        
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    victory() {
        this.gameState = 'victory';
        this.stopTimer();
        
        storage.saveWorldProgress(this.currentWorld, {
            stars: this.stars,
            score: this.score,
            bestTime: this.timeRemaining
        });
        
        this.showVictoryScreen();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.stopTimer();
        this.showGameOverScreen();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimer();
            showPauseMenu();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
            hidePauseMenu();
        }
    }
    
    nextWorld() {
        if (this.currentWorld < 4) {
            this.currentWorld++;
            this.startGame();
        } else {
            showCompletionScreen();
        }
    }
    
    retryWorld() {
        this.startGame();
    }
    
    getDifficultyMultiplier() {
        return this.difficulty === 'easy' ? 1 : 
               this.difficulty === 'normal' ? 1.5 : 2;
    }
    
    showVictoryScreen() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalStars').textContent = `${this.stars}/3`;
        document.getElementById('finalAccuracy').textContent = `${Math.floor(Math.random() * 40 + 60)}%`;
        document.getElementById('victoryScreen').classList.add('active');
    }
    
    showGameOverScreen() {
        document.getElementById('gameOverScreen').classList.add('active');
    }
    
    dispose() {
        this.stopTimer();
        this.scene.dispose();
        this.engine.dispose();
    }
}

// Instancia global
let game = null;

// Funciones de menú
function showDifficultyMenu() {
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('difficultyMenu').classList.add('active');
}

function selectDifficulty(difficulty) {
    game.difficulty = difficulty;
    document.getElementById('difficultyMenu').classList.remove('active');
    backToMenu();
}

function showInstructions() {
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('instructionsMenu').classList.add('active');
}

function showHighScores() {
    const scores = storage.getHighScores();
    let html = '';
    
    if (scores.length === 0) {
        html = '<p>Sin puntuaciones registradas. ¡Sé el primero!</p>';
    } else {
        scores.forEach((score, index) => {
            html += `
                <div class="score-item">
                    <span class="score-rank">#${index + 1}</span>
                    <span class="score-name">${score.name || 'Jugador'}</span>
                    <span class="score-value">${score.score}</span>
                </div>
            `;
        });
    }
    
    document.getElementById('scoresList').innerHTML = html;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('highScoresMenu').classList.add('active');
}

function backToMenu() {
    document.getElementById('difficultyMenu').classList.remove('active');
    document.getElementById('instructionsMenu').classList.remove('active');
    document.getElementById('highScoresMenu').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
}

function goToMainMenu() {
    document.getElementById('pauseMenu').classList.remove('active');
    document.getElementById('victoryScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('gameHUD').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
}

function togglePause() {
    if (game) {
        game.togglePause();
    }
}

function showPauseMenu() {
    document.getElementById('gameHUD').classList.remove('active');
    document.getElementById('pauseMenu').classList.add('active');
}

function hidePauseMenu() {
    document.getElementById('pauseMenu').classList.remove('active');
    document.getElementById('gameHUD').classList.add('active');
}

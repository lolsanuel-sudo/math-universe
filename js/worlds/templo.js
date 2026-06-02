/**
 * MUNDO 4: EL TEMPLO FINAL
 * Boss Battle - Desafío épico final
 */

class TemploWorld {
    constructor(scene, difficulty) {
        this.scene = scene;
        this.difficulty = difficulty;
        this.score = 0;
        this.boss = null;
        this.player = null;
        this.bossHealth = 10;
        this.currentProblem = null;
        this.phase = 1;
        
        this.init();
    }
    
    init() {
        this.createTemple();
        this.createPlayer();
        this.createBoss();
        this.generateNewProblem();
    }
    
    createTemple() {
        // Suelo del templo
        const ground = BABYLON.MeshBuilder.CreateGround("ground", 100, 100, 2, this.scene);
        ground.material = new BABYLON.StandardMaterial("groundMat", this.scene);
        ground.material.diffuse = new BABYLON.Color3(0.6, 0.5, 0.3);
        
        // Columnas
        for (let i = 0; i < 4; i++) {
            const column = BABYLON.MeshBuilder.CreateCylinder(
                `column_${i}`,
                { height: 15, diameter: 2 },
                this.scene
            );
            
            const angle = (i / 4) * Math.PI * 2;
            column.position = new BABYLON.Vector3(
                Math.cos(angle) * 20,
                7.5,
                Math.sin(angle) * 20
            );
            
            column.material = new BABYLON.StandardMaterial(`columnMat_${i}`, this.scene);
            column.material.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        }
        
        // Techo
        const roof = BABYLON.MeshBuilder.CreateBox("roof", { width: 50, height: 1, depth: 50 }, this.scene);
        roof.position.y = 15;
        roof.material = new BABYLON.StandardMaterial("roofMat", this.scene);
        roof.material.diffuse = new BABYLON.Color3(0.5, 0.3, 0.1);
        
        // Paredes
        const walls = BABYLON.MeshBuilder.CreateBox("walls", { width: 51, height: 20, depth: 51 }, this.scene);
        walls.position.y = 10;
        walls.material = new BABYLON.StandardMaterial("wallsMat", this.scene);
        walls.material.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        walls.material.wireframe = true;
        walls.material.alpha = 0.2;
    }
    
    createPlayer() {
        this.player = BABYLON.MeshBuilder.CreateSphere("player", 16, 1, this.scene);
        this.player.position = new BABYLON.Vector3(0, 2, -15);
        
        this.player.material = new BABYLON.StandardMaterial("playerMat", this.scene);
        this.player.material.emissiveColor = new BABYLON.Color3(0, 1, 1);
        
        this.player.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.player,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 1 },
            this.scene
        );
    }
    
    createBoss() {
        this.boss = BABYLON.MeshBuilder.CreateBox("boss", { width: 3, height: 5, depth: 3 }, this.scene);
        this.boss.position = new BABYLON.Vector3(0, 5, 15);
        
        this.boss.material = new BABYLON.StandardMaterial("bossMat", this.scene);
        this.boss.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
        this.boss.material.wireframe = false;
        
        this.boss.health = this.bossHealth;
        
        // Añadir efectos visuales
        GameAnimations.createRotation(this.boss);
        this.scene.beginAnimation(this.boss, 0, 60, true);
    }
    
    generateNewProblem() {
        const operations = ['+', '-', '*', '/'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let problem;
        switch(operation) {
            case '+': problem = ProblemGenerator.generateAdditionProblem(this.difficulty); break;
            case '-': problem = ProblemGenerator.generateSubtractionProblem(this.difficulty); break;
            case '*': problem = ProblemGenerator.generateMultiplicationProblem(this.difficulty); break;
            case '/': problem = ProblemGenerator.generateDivisionProblem(this.difficulty); break;
        }
        
        this.currentProblem = problem;
        
        const problemText = `${problem.operand1.toString()} ${problem.operation} ${problem.operand2.toString()}`;
        
        const answer = ProblemGenerator.solveProblem(
            problem.operand1,
            problem.operand2,
            problem.operation
        );
        
        const options = ProblemGenerator.generateMultipleChoice(answer, this.difficulty);
        
        const problemDisplay = document.getElementById('problemDisplay');
        const optionsHTML = options.map(opt => 
            `<button class="option-btn" onclick="game.world.checkAnswer('${opt.numerator}/${opt.denominator}')">${opt.toString()}</button>`
        ).join('');
        
        problemDisplay.innerHTML = `
            <div class="problem-text">${problemText} = ?</div>
            <div class="problem-options">${optionsHTML}</div>
        `;
    }
    
    checkAnswer(answer) {
        const correct = ProblemGenerator.solveProblem(
            this.currentProblem.operand1,
            this.currentProblem.operand2,
            this.currentProblem.operation
        );
        
        const [num, den] = answer.split('/').map(Number);
        const userAnswer = new Fraction(num, den);
        
        if (correct.equals(userAnswer)) {
            game.addScore(100);
            this.damageBoΣs();
            audioManager.play('success');
            
            if (this.boss.health <= 0) {
                this.bossFinal();
            } else {
                setTimeout(() => this.generateNewProblem(), 500);
            }
        } else {
            game.takeDamage(1);
            audioManager.play('error');
        }
    }
    
    damageBoss() {
        this.boss.health--;
        game.particleSystem.createExplosion(this.boss.position, 1);
        this.visualEffects.createFlash();
        
        if (this.boss.health <= 5) {
            this.boss.material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        }
        if (this.boss.health <= 0) {
            this.bossFinal();
        }
    }
    
    bossFinal() {
        this.boss.isVisible = false;
        game.particleSystem.createExplosion(this.boss.position, 3);
        audioManager.play('levelUp');
        game.addStar();
        
        setTimeout(() => {
            game.victory();
        }, 1500);
    }
    
    update(deltaTime) {
        if (!this.boss) return;
        
        // Hacer que el boss se mueva hacia el jugador
        const direction = BABYLON.Vector3.Normalize(
            BABYLON.Vector3.Subtract(this.player.position, this.boss.position)
        );
        
        this.boss.position.addInPlace(direction.scale(deltaTime * 2));
        
        // Detectar colisión
        const distance = BABYLON.Vector3.Distance(this.player.position, this.boss.position);
        if (distance < 3) {
            game.takeDamage(1);
        }
    }
    
    dispose() {
        if (this.boss) this.boss.dispose();
        if (this.player) this.player.dispose();
    }
}

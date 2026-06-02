/**
 * SISTEMA DE PARTÍCULAS
 * Efectos visuales dinámicos
 */

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.emitters = [];
    }
    
    // Crear emisor de partículas
    createEmitter(position, particleCount = 20, options = {}) {
        const emitter = {
            position: position.clone ? position.clone() : position,
            particleCount,
            particles: [],
            options: {
                speed: options.speed || 5,
                gravity: options.gravity || 0.1,
                lifetime: options.lifetime || 2,
                color: options.color || new BABYLON.Color3(0, 1, 1),
                size: options.size || 0.2,
                type: options.type || 'sphere',
                ...options
            }
        };
        
        this.createParticles(emitter);
        this.emitters.push(emitter);
        return emitter;
    }
    
    // Crear partículas
    createParticles(emitter) {
        for (let i = 0; i < emitter.particleCount; i++) {
            const particle = BABYLON.MeshBuilder.CreateSphere(
                `particle_${this.particles.length}`,
                4,
                emitter.options.size,
                this.scene
            );
            
            particle.material = new BABYLON.StandardMaterial(`particleMat_${i}`, this.scene);
            particle.material.emissiveColor = emitter.options.color;
            particle.material.wireframe = false;
            
            // Velocidad aleatoria
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * emitter.options.speed;
            
            particle.velocity = new BABYLON.Vector3(
                Math.cos(angle) * velocity * 0.5,
                Math.random() * emitter.options.speed,
                Math.sin(angle) * velocity * 0.5
            );
            
            particle.position = emitter.position.clone();
            particle.lifeTime = emitter.options.lifetime;
            particle.age = 0;
            particle.emitter = emitter;
            
            emitter.particles.push(particle);
            this.particles.push(particle);
        }
    }
    
    // Actualizar partículas
    update(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.age += deltaTime;
            
            if (particle.age >= particle.lifeTime) {
                particle.dispose();
                return false;
            }
            
            // Aplicar velocidad
            particle.position.addInPlace(
                particle.velocity.scale(deltaTime)
            );
            
            // Aplicar gravedad
            particle.velocity.y -= particle.emitter.options.gravity * deltaTime;
            
            // Fade out
            const alpha = 1 - (particle.age / particle.lifeTime);
            particle.material.alpha = alpha;
            
            return true;
        });
        
        // Limpiar emisores vacíos
        this.emitters = this.emitters.filter(emitter => emitter.particles.length > 0);
    }
    
    // Crear explosión
    createExplosion(position, intensity = 1) {
        const emitter = this.createEmitter(position, Math.floor(30 * intensity), {
            speed: 10 * intensity,
            lifetime: 1.5,
            color: new BABYLON.Color3(1, 0.5, 0),
            size: 0.3 * intensity
        });
        return emitter;
    }
    
    // Crear efecto de colección
    createCollectEffect(position, color = new BABYLON.Color3(0, 1, 1)) {
        return this.createEmitter(position, 15, {
            speed: 3,
            lifetime: 1,
            color: color,
            size: 0.15
        });
    }
    
    // Crear lluvia de estrellas
    createStarRain(position, count = 20) {
        return this.createEmitter(position, count, {
            speed: 2,
            gravity: 0.2,
            lifetime: 3,
            color: new BABYLON.Color3(1, 1, 0),
            size: 0.2
        });
    }
    
    // Limpiar todo
    dispose() {
        this.particles.forEach(p => p.dispose());
        this.particles = [];
        this.emitters = [];
    }
}

/**
 * EFECTOS VISUALES AVANZADOS
 */

class VisualEffects {
    constructor(scene) {
        this.scene = scene;
        this.postProcess = [];
    }
    
    // Efecto de destello
    createFlash(duration = 0.2) {
        const layer = new BABYLON.HighlightLayer("flash", this.scene);
        const timer = { time: 0, duration };
        
        const renderLoop = () => {
            timer.time += this.scene.getAnimationRatio();
            if (timer.time >= duration) {
                layer.dispose();
                this.scene.onBeforeRenderObservable.removeCallback(renderLoop);
            }
        };
        
        this.scene.onBeforeRenderObservable.add(renderLoop);
    }
    
    // Efecto de daño
    createDamageFlash(mesh) {
        const originalColor = mesh.material.emissiveColor.clone();
        mesh.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
        
        setTimeout(() => {
            mesh.material.emissiveColor = originalColor;
        }, 100);
    }
    
    // Efecto de movimiento rápido
    createSpeedLines(position, direction, count = 5) {
        const lines = [];
        for (let i = 0; i < count; i++) {
            const line = BABYLON.MeshBuilder.CreateTube(
                `speedLine_${i}`,
                [position, position.add(direction.scale(2))],
                0.1,
                4,
                this.scene
            );
            
            line.material = new BABYLON.StandardMaterial(`speedLineMat_${i}`, this.scene);
            line.material.emissiveColor = new BABYLON.Color3(0, 1, 1);
            line.material.alpha = 0.6;
            
            lines.push(line);
        }
        
        // Animar desaparición
        setTimeout(() => {
            lines.forEach(line => line.dispose());
        }, 200);
    }
}

/**
 * ANIMACIONES BABYLON
 */

class GameAnimations {
    static createRotation(mesh, duration = 1000) {
        const animation = new BABYLON.Animation(
            "rotation",
            "rotation",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [
            { frame: 0, value: mesh.rotation },
            { frame: 60, value: new BABYLON.Vector3(
                mesh.rotation.x + Math.PI * 2,
                mesh.rotation.y + Math.PI * 2,
                mesh.rotation.z
            )}
        ];
        
        animation.setKeys(keys);
        mesh.animations.push(animation);
        return animation;
    }
    
    static createBounce(mesh, height = 2, duration = 600) {
        const animation = new BABYLON.Animation(
            "bounce",
            "position.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [
            { frame: 0, value: mesh.position.y },
            { frame: 30, value: mesh.position.y + height },
            { frame: 60, value: mesh.position.y }
        ];
        
        animation.setKeys(keys);
        mesh.animations.push(animation);
        return animation;
    }
    
    static createPulse(mesh, scaleStart = 1, scaleEnd = 1.2, duration = 600) {
        const animation = new BABYLON.Animation(
            "pulse",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const scale = new BABYLON.Vector3(scaleStart, scaleStart, scaleStart);
        const endScale = new BABYLON.Vector3(scaleEnd, scaleEnd, scaleEnd);
        
        const keys = [
            { frame: 0, value: scale },
            { frame: 30, value: endScale },
            { frame: 60, value: scale }
        ];
        
        animation.setKeys(keys);
        mesh.animations.push(animation);
        return animation;
    }
    
    static createFloating(mesh, distance = 0.5, duration = 2000) {
        const startY = mesh.position.y;
        const animation = new BABYLON.Animation(
            "floating",
            "position.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [
            { frame: 0, value: startY },
            { frame: 30, value: startY + distance },
            { frame: 60, value: startY }
        ];
        
        animation.setKeys(keys);
        mesh.animations.push(animation);
        return animation;
    }
    
    static playAnimation(mesh, animation, duration = 600) {
        const scene = mesh.getScene();
        return scene.beginAnimation(mesh, 0, 60, false, duration / 1000);
    }
}

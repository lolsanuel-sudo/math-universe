/**
 * UTILIDADES MATEMÁTICAS PARA FRACCIONES
 * Operaciones y manipulación de fracciones
 */

class Fraction {
    constructor(numerator, denominator) {
        if (denominator === 0) {
            throw new Error("El denominador no puede ser cero");
        }
        
        const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
        this.numerator = (numerator / gcd) * Math.sign(denominator);
        this.denominator = Math.abs(denominator / gcd);
    }
    
    // Máximo común divisor
    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }
    
    // Sumar fracciones
    add(other) {
        const num = this.numerator * other.denominator + 
                    other.numerator * this.denominator;
        const den = this.denominator * other.denominator;
        return new Fraction(num, den);
    }
    
    // Restar fracciones
    subtract(other) {
        return this.add(new Fraction(-other.numerator, other.denominator));
    }
    
    // Multiplicar fracciones
    multiply(other) {
        const num = this.numerator * other.numerator;
        const den = this.denominator * other.denominator;
        return new Fraction(num, den);
    }
    
    // Dividir fracciones
    divide(other) {
        if (other.numerator === 0) {
            throw new Error("No se puede dividir por cero");
        }
        return this.multiply(new Fraction(other.denominator, other.numerator));
    }
    
    // Comparar fracciones
    equals(other) {
        return this.numerator === other.numerator && 
               this.denominator === other.denominator;
    }
    
    // Obtener valor decimal
    toDecimal() {
        return this.numerator / this.denominator;
    }
    
    // Representación como string
    toString() {
        if (this.denominator === 1) {
            return String(this.numerator);
        }
        return `${this.numerator}/${this.denominator}`;
    }
    
    // Clonar fracción
    clone() {
        return new Fraction(this.numerator, this.denominator);
    }
}

// Generador de problemas matemáticos
class ProblemGenerator {
    static generateFractionPair(difficulty) {
        const max = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 10 : 20;
        const min = 1;
        
        let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        let den1 = Math.floor(Math.random() * (max - min + 1)) + min;
        let num2 = Math.floor(Math.random() * (max - min + 1)) + min;
        let den2 = Math.floor(Math.random() * (max - min + 1)) + min;
        
        return [new Fraction(num1, den1), new Fraction(num2, den2)];
    }
    
    static generateAdditionProblem(difficulty) {
        let [f1, f2] = this.generateFractionPair(difficulty);
        
        // Para problemas de suma fácil, usar el mismo denominador
        if (difficulty === 'easy') {
            f2 = new Fraction(f2.numerator, f1.denominator);
        }
        
        return { operand1: f1, operand2: f2, operation: '+' };
    }
    
    static generateSubtractionProblem(difficulty) {
        let [f1, f2] = this.generateFractionPair(difficulty);
        
        if (difficulty === 'easy') {
            f2 = new Fraction(f2.numerator, f1.denominator);
        }
        
        // Asegurarse que f1 >= f2
        if (f1.toDecimal() < f2.toDecimal()) {
            [f1, f2] = [f2, f1];
        }
        
        return { operand1: f1, operand2: f2, operation: '-' };
    }
    
    static generateMultiplicationProblem(difficulty) {
        let [f1, f2] = this.generateFractionPair(difficulty);
        return { operand1: f1, operand2: f2, operation: '*' };
    }
    
    static generateDivisionProblem(difficulty) {
        let [f1, f2] = this.generateFractionPair(difficulty);
        return { operand1: f1, operand2: f2, operation: '/' };
    }
    
    static generateMixedProblem(difficulty) {
        const problems = [
            'generateAdditionProblem',
            'generateSubtractionProblem',
            'generateMultiplicationProblem',
            'generateDivisionProblem'
        ];
        
        const randomProblem = problems[Math.floor(Math.random() * problems.length)];
        return this[randomProblem](difficulty);
    }
    
    static solveProblem(operand1, operand2, operation) {
        switch(operation) {
            case '+': return operand1.add(operand2);
            case '-': return operand1.subtract(operand2);
            case '*': return operand1.multiply(operand2);
            case '/': return operand1.divide(operand2);
            default: throw new Error("Operación desconocida");
        }
    }
    
    static generateMultipleChoice(correct, difficulty) {
        const options = [correct.clone()];
        const max = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 4 : 5;
        
        while (options.length < max) {
            const randomNum = Math.floor(Math.random() * 20) + 1;
            const randomDen = Math.floor(Math.random() * 20) + 1;
            const option = new Fraction(randomNum, randomDen);
            
            if (!options.some(opt => opt.equals(option))) {
                options.push(option);
            }
        }
        
        // Mezclar opciones
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options;
    }
}

// Utilidades de cálculo
const MathUtils = {
    // Distancia entre dos puntos 3D
    distance: (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    // Distancia entre dos puntos 2D
    distance2D: (p1, p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Lerp (interpolación lineal)
    lerp: (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t)),
    
    // Clamp un valor
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    // Mapa un valor de un rango a otro
    map: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    
    // Suavizado
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Fraction, ProblemGenerator, MathUtils };
}

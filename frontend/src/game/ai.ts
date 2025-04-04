import { paddle2, ball, canvasHeight, PLAYER_PADDLE_SPEED } from './objects';

export enum AIDifficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard'
}

// Configuration des paramètres par difficulté
interface AIConfig {
    reactionTime: number;  // Temps de réaction de l'IA (en ms)
    errorMargin: number;   // Marge d'erreur dans le suivi de la balle (0 = parfait)
    predictionAccuracy: number; // Précision de la prédiction (0-1)
    maxSpeed: number;      // Vitesse maximale de déplacement de la raquette de l'IA
    minStateHoldTime: number; // Temps minimum pour maintenir un état (en ms)
    threshold: number;     // Seuil de distance pour décider de bouger
    maxBounces: number;    // Nombre maximum de rebonds à prédire
}

const difficultyConfigs: Record<AIDifficulty, AIConfig> = {
    [AIDifficulty.EASY]: {
        reactionTime: 1000,       // Maintenu à 1000ms comme demandé
        errorMargin: 80,          // Augmenté pour compenser la vitesse limitée
        predictionAccuracy: 0.3,  // Réduit pour rendre l'IA plus facile
        maxSpeed: PLAYER_PADDLE_SPEED, // Même vitesse que le joueur
        minStateHoldTime: 450,    // Temps de maintien d'état maintenu
        threshold: 100,           // Augmenté pour moins de précision
        maxBounces: 1             // Toujours un seul rebond maximum
    },
    [AIDifficulty.NORMAL]: {
        reactionTime: 1000,       // Maintenu à 1000ms comme demandé
        errorMargin: 40,          // Maintenu
        predictionAccuracy: 0.6,  // Maintenu
        maxSpeed: PLAYER_PADDLE_SPEED, // Même vitesse que le joueur
        minStateHoldTime: 300,    // Maintenu
        threshold: 50,            // Maintenu
        maxBounces: 2             // Maintenu
    },
    [AIDifficulty.HARD]: {
        reactionTime: 1000,       // Maintenu à 1000ms comme demandé
        errorMargin: 5,           // Maintenu à 5 pour plus de précision
        predictionAccuracy: 0.95, // Légèrement réduit pour compenser la vitesse limitée
        maxSpeed: PLAYER_PADDLE_SPEED, // Même vitesse que le joueur
        minStateHoldTime: 80,     // Maintenu
        threshold: 15,            // Maintenu
        maxBounces: 6             // Légèrement réduit pour compenser
    }
};

// Types pour la machine à états
type AIState = 'waiting' | 'moveUp' | 'moveDown' | 'idle';

// Facteurs d'amélioration après une défaite
interface AIImprovement {
    accuracyIncrease: number;  // Augmentation de la précision
    errorReduction: number;    // Réduction de la marge d'erreur
    bounceIncrease: number;    // Augmentation du nombre de rebonds prédits
    thresholdReduction: number; // Réduction du seuil de mouvement
    stateHoldReduction: number; // Réduction du temps de maintien d'état
}

const difficultyImprovements: Record<AIDifficulty, AIImprovement> = {
    [AIDifficulty.EASY]: {
        accuracyIncrease: 0.05, // +5% de précision
        errorReduction: 5,      // -5 pixels d'erreur
        bounceIncrease: 0.2,    // +0.2 rebonds (arrondi)
        thresholdReduction: 10, // -10 pixels de seuil
        stateHoldReduction: 20  // -20ms de temps de maintien
    },
    [AIDifficulty.NORMAL]: {
        accuracyIncrease: 0.07, // +7% de précision
        errorReduction: 7,      // -7 pixels d'erreur
        bounceIncrease: 0.5,    // +0.5 rebonds (arrondi)
        thresholdReduction: 5,  // -5 pixels de seuil
        stateHoldReduction: 30  // -30ms de temps de maintien
    },
    [AIDifficulty.HARD]: {
        accuracyIncrease: 0.01, // +1% de précision (déjà très précis)
        errorReduction: 1,      // -1 pixel d'erreur
        bounceIncrease: 0.5,    // +0.5 rebond (au lieu de 1)
        thresholdReduction: 2,  // -2 pixels de seuil
        stateHoldReduction: 5   // -5ms de temps de maintien
    }
};

// Limites maximales pour éviter que l'IA ne devienne trop forte
const maxValues: Record<AIDifficulty, Partial<AIConfig>> = {
    [AIDifficulty.EASY]: {
        predictionAccuracy: 0.6,  // Précision max
        errorMargin: 40,          // Erreur minimale
        maxBounces: 2,            // Rebonds max
        minStateHoldTime: 300,    // Temps de maintien minimal
        threshold: 50             // Seuil minimal
    },
    [AIDifficulty.NORMAL]: {
        predictionAccuracy: 0.85, // Précision max
        errorMargin: 15,          // Erreur minimale
        maxBounces: 4,            // Rebonds max
        minStateHoldTime: 150,    // Temps de maintien minimal
        threshold: 25             // Seuil minimal
    },
    [AIDifficulty.HARD]: {
        predictionAccuracy: 0.99, // Précision max
        errorMargin: 2,           // Erreur minimale
        maxBounces: 8,            // Rebonds max (au lieu de 10)
        minStateHoldTime: 50,     // Temps de maintien minimal
        threshold: 8              // Seuil minimal
    }
};

// Données de l'IA
let currentDifficulty: AIDifficulty = AIDifficulty.NORMAL;
let config: AIConfig = difficultyConfigs[AIDifficulty.NORMAL];
let lastStateChangeTime = 0;      // Quand le dernier changement d'état a eu lieu
let lastDecisionTime = 0;         // Quand la dernière décision a été prise (1 fois par seconde)
let targetY = canvasHeight / 2;   // Position cible initiale (milieu)
let currentState: AIState = 'idle';  // État actuel de l'IA
let consecutiveLosses = 0;        // Nombre de défaites consécutives

// Simuler les touches du clavier
export const aiKeyState = {
    ArrowUp: false,
    ArrowDown: false
};

// Réinitialiser l'IA
export function resetAI() {
    lastStateChangeTime = 0;
    lastDecisionTime = 0;
    targetY = canvasHeight / 2;
    currentState = 'idle';
    aiKeyState.ArrowUp = false;
    aiKeyState.ArrowDown = false;
}

export function setAIDifficulty(difficulty: AIDifficulty) {
    currentDifficulty = difficulty;
    config = difficultyConfigs[difficulty];
    
    // S'assurer que la vitesse est toujours égale à celle du joueur
    paddle2.speed = PLAYER_PADDLE_SPEED;
    
    console.log(`IA configurée en difficulté: ${difficulty}, vitesse: ${paddle2.speed}, précision: ${config.predictionAccuracy}, erreur: ${config.errorMargin}`);
    resetAI();
}

// Fonction appelée quand l'IA perd une partie
export function onAILoss() {
    consecutiveLosses++;
    
    console.log(`L'IA a perdu ${consecutiveLosses} fois consécutives, amélioration en cours...`);
    
    // Récupérer les améliorations pour la difficulté actuelle
    const improvements = difficultyImprovements[currentDifficulty];
    const limits = maxValues[currentDifficulty];
    
    // Copier la configuration actuelle pour la modifier
    const newConfig = { ...difficultyConfigs[currentDifficulty] };
    
    // Appliquer les améliorations avec limites (sans toucher à la vitesse)
    newConfig.predictionAccuracy = Math.min(
        newConfig.predictionAccuracy + improvements.accuracyIncrease,
        limits.predictionAccuracy || 0.99
    );
    
    newConfig.errorMargin = Math.max(
        newConfig.errorMargin - improvements.errorReduction,
        limits.errorMargin || 1
    );
    
    newConfig.maxBounces = Math.min(
        newConfig.maxBounces + improvements.bounceIncrease,
        limits.maxBounces || 8
    );
    
    // Améliorer les nouveaux paramètres
    newConfig.threshold = Math.max(
        newConfig.threshold - improvements.thresholdReduction,
        limits.threshold || 5
    );
    
    newConfig.minStateHoldTime = Math.max(
        newConfig.minStateHoldTime - improvements.stateHoldReduction,
        limits.minStateHoldTime || 50
    );
    
    // Mettre à jour la configuration
    difficultyConfigs[currentDifficulty] = newConfig;
    
    // Appliquer la nouvelle configuration
    setAIDifficulty(currentDifficulty);
    
    console.log(`IA améliorée: précision=${newConfig.predictionAccuracy}, erreur=${newConfig.errorMargin}, rebonds=${newConfig.maxBounces}, seuil=${newConfig.threshold}, maintien=${newConfig.minStateHoldTime}`);
}

// Fonction appelée quand l'IA gagne une partie, réinitialise le compteur de défaites
export function onAIWin() {
    if (consecutiveLosses > 0) {
        console.log(`L'IA a gagné, réinitialisation du compteur de défaites (était: ${consecutiveLosses})`);
        consecutiveLosses = 0;
    }
}

export function getAIDifficulty(): AIDifficulty {
    return currentDifficulty;
}

// Prédit où la balle va traverser la ligne de la raquette
function predictBallIntersection(): number {
    // Si la balle va vers le joueur (gauche) ou est immobile
    if (ball.speedX <= 0) {
        // En mode facile, l'IA reste plus souvent au centre mais suit un peu la balle
        if (currentDifficulty === AIDifficulty.EASY) {
            // 80% position centrale, 20% position de la balle (au lieu de 100% centre)
            return (canvasHeight / 2) * 0.8 + ball.y * 0.2;
        }
        
        // En mode normal, l'IA suit un peu la position Y actuelle de la balle
        if (currentDifficulty === AIDifficulty.NORMAL) {
            // 70% position centrale, 30% position de la balle
            return (canvasHeight / 2) * 0.7 + ball.y * 0.3;
        }
        
        // En mode difficile, l'IA anticipe beaucoup mieux le retour
        // 10% position centrale, 90% position de la balle (au lieu de 30/70)
        return (canvasHeight / 2) * 0.1 + ball.y * 0.9;
    }

    // Calcul de base pour trouver où la balle va toucher la ligne de la raquette
    const distanceToRightPaddle = paddle2.x - ball.x;
    const timeToReachPaddle = ball.speedX !== 0 ? distanceToRightPaddle / ball.speedX : 1000;
    
    // Position Y prédite au moment de l'intersection
    let predictedY = ball.y + (ball.speedY * timeToReachPaddle);
    
    // Simulation des rebonds sur les bords du canvas
    let bounceCount = 0;
    
    while ((predictedY < 0 || predictedY > canvasHeight) && bounceCount < config.maxBounces) {
        if (predictedY < 0) {
            predictedY = -predictedY; // Rebond en haut
        } else if (predictedY > canvasHeight) {
            predictedY = 2 * canvasHeight - predictedY; // Rebond en bas
        }
        bounceCount++;
    }
    
    // S'assurer que la valeur est dans les limites
    predictedY = Math.max(0, Math.min(canvasHeight, predictedY));
    
    // Ajouter une marge d'erreur en fonction de la difficulté
    // Mode facile: erreur plus grande et constante, mais réduite
    if (currentDifficulty === AIDifficulty.EASY) {
        // Erreur plus grande et souvent vers le centre
        const centerBias = (canvasHeight / 2 - predictedY) * 0.3;
        predictedY += centerBias + (Math.random() * config.errorMargin - config.errorMargin / 2);
    } 
    // Mode normal: erreur moyenne
    else if (currentDifficulty === AIDifficulty.NORMAL) {
        if (Math.random() > config.predictionAccuracy) {
            predictedY += (Math.random() * config.errorMargin * 2 - config.errorMargin);
        }
    } 
    // Mode difficile: erreur très petite et très rare
    else {
        if (Math.random() > config.predictionAccuracy) {
            // Erreur réduite pour le mode difficile
            predictedY += (Math.random() * config.errorMargin - config.errorMargin / 2);
        }
        
        // Amélioration de prédiction pour le mode difficile: 
        // anticipation de la direction future de la balle
        if (bounceCount === 0 && ball.speedY !== 0) {
            // Ajouter un ajustement plus important pour anticiper la direction future
            const anticipationFactor = 25; // pixels (augmenté de 15 à 25)
            predictedY += Math.sign(ball.speedY) * anticipationFactor;
        }
        
        // Ajout d'une compensation pour les rebonds multiples
        if (bounceCount > 0) {
            // Ajustement supplémentaire pour améliorer la prédiction des rebonds complexes
            predictedY += Math.sign(ball.speedY) * (5 * bounceCount);
        }
    }
    
    // S'assurer que la valeur reste dans les limites du canvas
    predictedY = Math.max(0, Math.min(canvasHeight, predictedY));
    
    return predictedY;
}

// Détermine le prochain état basé sur la position actuelle et la cible
function determineNextState(paddleCenter: number, targetPosition: number): AIState {
    // Calcul de la distance
    const distance = targetPosition - paddleCenter;
    
    // Seuil adapté à la difficulté
    if (Math.abs(distance) <= config.threshold) {
        return 'idle';
    } else if (distance < 0) {
        return 'moveUp';
    } else {
        return 'moveDown';
    }
}

// Fonction principale pour mettre à jour la position de l'IA
export function updateAI(currentTime: number) {
    // 1. Mettre à jour la décision en fonction du temps de réaction
    const shouldMakeNewDecision = currentTime - lastDecisionTime >= config.reactionTime;
    
    // 2. Permettre le changement d'état seulement si on a maintenu l'état actuel suffisamment longtemps
    const canChangeState = currentTime - lastStateChangeTime >= config.minStateHoldTime;
    
    // Si c'est le moment de prendre une nouvelle décision
    if (shouldMakeNewDecision) {
        lastDecisionTime = currentTime;
        
        // En mode facile, parfois l'IA "oublie" de prendre une décision, mais moins souvent (20% au lieu de 30%)
        if (currentDifficulty === AIDifficulty.EASY && Math.random() < 0.2) {
            // Ne rien faire, garder la cible précédente
        } else {
            // Calculer la nouvelle position cible
            targetY = predictBallIntersection();
        }
    }
    
    // Si on peut changer d'état
    if (canChangeState) {
        // Position centrale de la raquette
        const paddleCenter = paddle2.y + (paddle2.height / 2);
        
        // Déterminer le prochain état
        const nextState = determineNextState(paddleCenter, targetY);
        
        // Mode facile: parfois ignore le changement d'état (15% au lieu de 20%)
        if (currentDifficulty === AIDifficulty.EASY && currentState !== 'idle' && Math.random() < 0.15) {
            // Continuer avec l'état actuel
        } 
        // Mode difficile: optimisation pour les petits mouvements
        else if (currentDifficulty === AIDifficulty.HARD && nextState !== currentState) {
            // Distance à la cible
            const distance = Math.abs(targetY - paddleCenter);
            
            // Pour les petites distances, transitions plus fluides (seuil augmenté de 40 à 60)
            if (distance < 60) {
                // Transition immédiate sans attendre le temps minimum
                lastStateChangeTime = currentTime - config.minStateHoldTime;
            }
            
            // Appliquer le nouvel état
            currentState = nextState;
            
            // Mettre à jour les touches en fonction du nouvel état
            aiKeyState.ArrowUp = false;
            aiKeyState.ArrowDown = false;
            
            if (currentState === 'moveUp') {
                aiKeyState.ArrowUp = true;
            } else if (currentState === 'moveDown') {
                aiKeyState.ArrowDown = true;
            }
        }
        // Sinon, appliquer le changement d'état si nécessaire
        else if (nextState !== currentState) {
            // Mettre à jour le temps de changement d'état
            lastStateChangeTime = currentTime;
            
            // Appliquer le nouvel état
            currentState = nextState;
            
            // Mettre à jour les touches en fonction du nouvel état
            aiKeyState.ArrowUp = false;
            aiKeyState.ArrowDown = false;
            
            if (currentState === 'moveUp') {
                aiKeyState.ArrowUp = true;
            } else if (currentState === 'moveDown') {
                aiKeyState.ArrowDown = true;
            }
        }
    }
    
    // Gérer les cas limites pour éviter de sortir du canvas
    if (paddle2.y <= 0 && aiKeyState.ArrowUp) {
        aiKeyState.ArrowUp = false;
        currentState = 'idle';
        lastStateChangeTime = currentTime; // Forcer un délai avant le prochain changement
    } else if (paddle2.y + paddle2.height >= canvasHeight && aiKeyState.ArrowDown) {
        aiKeyState.ArrowDown = false;
        currentState = 'idle';
        lastStateChangeTime = currentTime; // Forcer un délai avant le prochain changement
    }
    
    // Mode difficile: ajustement plus fin pour éviter l'oscillation
    if (currentDifficulty === AIDifficulty.HARD) {
        // Seuil réduit pour plus de précision (8 au lieu de 10)
        if (Math.abs(paddle2.y + paddle2.height/2 - targetY) < 8) {
            // Si on est très proche de la cible, s'arrêter pour éviter l'oscillation
            aiKeyState.ArrowUp = false;
            aiKeyState.ArrowDown = false;
            currentState = 'idle';
        }
    } else {
        // Pour les autres niveaux, conserver le comportement original
        if (currentDifficulty === AIDifficulty.NORMAL && Math.abs(paddle2.y + paddle2.height/2 - targetY) < 20) {
            aiKeyState.ArrowUp = false;
            aiKeyState.ArrowDown = false;
            currentState = 'idle';
        }
    }
} 
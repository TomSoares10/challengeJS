let player;
let enemies = [];
let playerWeapons = [];
let gameOverFrames = 0; // Compteur pour l'animation de Game Over

function setup() {
    createCanvas(800, 600);
    player = new Player();
    enemies = []; // Réinitialise les ennemis pour une nouvelle partie
    playerWeapons = []; // Réinitialise les armes du joueur
}

function draw() {
    background(220);

    player.display();
    player.move();

    handleEnemies();
    handleWeapons();

    // Vérifie si le jeu est perdu
    checkGameOver();
}

function gameOver() {
    noLoop(); // Arrête la boucle draw
    gameOverAnimation(); // Commence l'animation de Game Over
}
function gameOverAnimation() {
    let alpha = map(sin(gameOverFrames), -1, 1, 100, 255); // Animation clignotante
    background(0, alpha); // Fond semi-transparent noir

    fill(255, 0, 0, alpha);
    textSize(64);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2);

    gameOverFrames += 0.1;
    if (gameOverFrames < PI * 2) { // Continue l'animation pendant un certain temps
        requestAnimationFrame(gameOverAnimation);
    } else {
        showRestartButton(); // Montre le bouton pour redémarrer le jeu
    }
}

function showRestartButton() {
    // Crée un bouton pour redémarrer le jeu, ajustez selon votre structure HTML/JS
    let btn = createButton('Rejouer');
    btn.position(width / 2 - 40, height / 2 + 40);
    btn.mousePressed(restartGame);
}

function restartGame() {
    // Réinitialise le jeu
    gameOverFrames = 0;
    enemies = [];
    playerWeapons = [];
    loop(); // Redémarre la boucle draw
}

function checkGameOver() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        // Si un ennemi touche le joueur ou atteint le bas de l'écran
        if (enemies[i].hits(player) || enemies[i].y > height) {
            gameOver(); // Appelle la fonction gameOver
            break; // Sort de la boucle pour éviter des vérifications inutiles
        }
    }
}

function handleEnemies() {
    // Gérer la logique d'apparition et d'affichage des ennemis
    if (frameCount % 120 === 0) { // Ajouter un ennemi toutes les 120 frames
        enemies.push(new Enemy(random(width), -10));
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].display();

        // Vérifier la collision entre le joueur et les ennemis
        if (enemies[i].hits(player)) {
            // Déclencher un tir automatique au lieu de supprimer l'ennemi
            autoFire(enemies[i].x, enemies[i].y);
            enemies.splice(i, 1); // Supprimer l'ennemi
        }
    }
}


function handleWeapons() {
    // Gérer les armes obtenues par le joueur
    for (let weapon of playerWeapons) {
        weapon.display();
        weapon.move();
    }
}



class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 60;
        this.size = 50;
    }

    display() {
        fill(0, 0, 255);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        if (keyIsDown(LEFT_ARROW)) this.x -= 5;
        if (keyIsDown(RIGHT_ARROW)) this.x += 5;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.speed = 2;
    }

    display() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        this.y += this.speed;
    }

    hits(player) {
        let d = dist(this.x, this.y, player.x, player.y);
        return d < this.size / 2 + player.size / 2;
    }
}


// Les classes Player et Enemy restent inchangées

class Weapon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
    }

    display() {
        fill(0, 255, 0);
        ellipse(this.x, this.y, this.size, this.size); // Dessine l'arme
    }

    move() {
        this.y -= this.speed; // Fait bouger l'arme vers le haut
        if (this.y < 0) {
            let index = playerWeapons.indexOf(this);
            if (index > -1) {
                playerWeapons.splice(index, 1); // Supprime l'arme si elle sort du canevas
            }
        }

        // Vérifier la collision avec les ennemis
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (dist(this.x, this.y, enemies[i].x, enemies[i].y) < this.size / 2 + enemies[i].size / 2) {
                enemies.splice(i, 1); // Élimine l'ennemi touché
                let index = playerWeapons.indexOf(this);
                if (index > -1) {
                    playerWeapons.splice(index, 1); // Supprime l'arme après avoir touché l'ennemi
                }
                break;
            }
        }
    }
}

// Fonction mouseClicked pour lancer une arme
function mouseClicked() {
    if (playerWeapons.length < 5) { // Limite le nombre d'armes que le joueur peut lancer simultanément
        playerWeapons.push(new Weapon(player.x, player.y - player.size / 2));
    }
}


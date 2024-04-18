let player;
let enemies = [];
let playerWeapons = [];
let gameOverFrames = 0; // Compteur pour l'animation de Game Over
let canvas; // Variable globale pour référencer le canvas
let score = 0; // Variable pour stocker le score du joueur
let enemySpeedMultiplier = 1; // Multiplieur de vitesse pour les ennemis

function setup() {
    window.canvas = createCanvas(800, 600);
    initializeGame();
}


function initializeGame() {
    player = new Player();
    enemies = [];
    playerWeapons = [];
    score = 0;
    enemySpeedMultiplier = 1;
    loop();
}

function draw() {
    background(220);
    player.display();
    player.move();
    handleEnemies();
    handleWeapons();
    displayHUD(); // Affiche le score et la santé

    checkGameOver();
}

function displayHUD() {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 10, 10);
    text(`Health: ${player.health}`, 10, 40); // Affiche la santé du joueur
}

function mouseClicked() {
    if (playerWeapons.length < 5) {
        playerWeapons.push(new Weapon(player.x, player.y - player.size / 2));
        enemySpeedMultiplier += 0.05; // Augmente la vitesse des ennemis à chaque tir
    }
}

function handleEnemies() {
    if (frameCount % 120 === 0) {
        enemies.push(new Enemy(random(width), -10));
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].display();
        if (enemies[i].hits(player)) {
            gameOver();
            break;
        }
    }
}

function handleWeapons() {
    for (let weapon of playerWeapons) {
        weapon.display();
        weapon.move();
    }
}

function gameOver() {
    noLoop();
    let pseudo = prompt("Game Over. Entrez votre pseudo pour enregistrer votre score:", "");
    if (pseudo) {
        saveScore(score, pseudo);
        showLeaderboard();
    }
    gameOverAnimation();
}

// Méthodes supplémentaires comme saveScore(), showLeaderboard(), gameOverAnimation() restent inchangées

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 60;
        this.size = 50;
        this.health = 100;
    }

    display() {
        fill(0, 0, 255);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        if (keyIsDown(LEFT_ARROW) && this.x > this.size / 2) this.x -= 5;
        if (keyIsDown(RIGHT_ARROW) && this.x < width - this.size / 2) this.x += 5;
    }

    loseHealth(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            gameOver();
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.speed = 2 * enemySpeedMultiplier;
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

class Weapon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
    }

    display() {
        fill(0, 255, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        this.y -= this.speed;
        if (this.y < 0) {
            player.loseHealth(10);
            let index = playerWeapons.indexOf(this);
            if (index > -1) {
                playerWeapons.splice(index, 1);
            }
        }
    }
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

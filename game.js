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
    console.log("Drawing frame");
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
        enemySpeedMultiplier += 0.05 // Augmente la vitesse des ennemis à chaque tir
    }
}

function handleEnemies() {
    if (frameCount % 120 === 0) {
        enemies.push(new Enemy(random(width), -10));
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].display();
        if (enemies[i].y > height) {
            player.loseHealth(10); // L'ennemi a dépassé le bas de l'écran
            enemies.splice(i, 1); // Supprimer l'ennemi
        }
        else if (enemies[i].hits(player)) {
            player.loseHealth(10);
            enemies.splice(i, 1); // Supprimer l'ennemi immédiatement
        }
    }
}




function handleWeapons() {
    for (let i = playerWeapons.length - 1; i >= 0; i--) {
        let weapon = playerWeapons[i];
        weapon.display();
        weapon.move();

        let hitSomething = false; // Pour vérifier si une arme touche un ennemi

        for (let j = enemies.length - 1; j >= 0; j--) {
            if (weapon.hits(enemies[j])) {
                playerWeapons.splice(i, 1); // Supprimer la balle
                enemies.splice(j, 1); // Supprimer l'ennemi
                score += 100; // Augmenter le score, par exemple
                hitSomething = true;
                break; // Sortir de la boucle après une collision pour éviter des erreurs d'indice
            }
        }

        // Si la balle n'a rien touché et sort du canvas
        if (!hitSomething && weapon.y < 0) {
            player.loseHealth(10);
            playerWeapons.splice(i, 1); // Supprimer la balle
        }
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
        this.speed = 2;  // Vitesse initiale
    }

    display() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        this.y += this.speed * enemySpeedMultiplier;
    }

    hits(player) {
        let d = dist(this.x, this.y, player.x, player.y);
        return d < (this.size / 2 + player.size / 2);
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
    }

    hits(enemy) {
        let d = dist(this.x, this.y, enemy.x, enemy.y);
        return d < (this.size / 2 + enemy.size / 2);
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

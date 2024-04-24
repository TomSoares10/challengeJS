let player;
let enemies = [];
let playerWeapons = [];
let gameOverFrames = 0; // Compteur pour l'animation de Game Over
let canvas; // Variable globale pour référencer le canvas
let score = 0; // Variable pour stocker le score du joueur
let enemySpeedMultiplier = 1; // Multiplieur de vitesse pour les ennemis
let tripleShotActive = false;
let tripleShotDuration = 300; // Durée du bonus en nombre de frames
let powerUps = []; // Liste pour stocker les power-ups
let playerImg;
let enemyImg;
let tripleShotImg; // Variable pour stocker l'image du bonus de tir triple

function preload() {
    playerImg = loadImage('image/vaiseau.png');
    enemyImg = loadImage('image/ennemi.png');
    tripleShotImg = loadImage('image/bonustripletir.png');
}


function setup() {
    canvas = createCanvas(800, 600);
    initializeGame();
}

function initializeGame() {
    localStorage.clear();
    player = new Player();
    enemies = [];
    playerWeapons = [];
    powerUps = [];
    score = 0;
    enemySpeedMultiplier = 1;
    tripleShotActive = false;
    loop();
}

function draw() {
    background(220);
    player.display();
    player.move();
    handleEnemies();
    handleWeapons();
    handlePowerUps();
    displayHUD();
    checkGameOver();
}

function displayHUD() {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 10, 10);
    text(`Health: ${player.health}`, 10, 40);
}

function mouseClicked() {
    // Vérifie si moins de 5 armes sont actives avant de permettre de tirer
    if (playerWeapons.length < 5) {
        if (tripleShotActive) {
            // Tirer en trois directions si le bonus est actif
            playerWeapons.push(new Weapon(player.x, player.y, 0)); // Tir direct
            playerWeapons.push(new Weapon(player.x, player.y, radians(5))); // Légèrement à droite
            playerWeapons.push(new Weapon(player.x, player.y, radians(-5))); // Légèrement à gauche
        } else {
            // Tir normal
            playerWeapons.push(new Weapon(player.x, player.y, 0));
        }
    }
}


function handleEnemies() {
    if (frameCount % 120 === 0) {
        enemies.push(new Enemy(random(width), -30));
    }

    enemies.forEach((enemy, index) => {
        enemy.move();
        enemy.display();
        if (enemy.y > height + enemy.size) {
            enemies.splice(index, 1);
        } else if (enemy.hits(player)) {
            player.loseHealth(10);
            enemies.splice(index, 1);
        }
    });
}

function handleWeapons() {
    for (let i = playerWeapons.length - 1; i >= 0; i--) {
        let weapon = playerWeapons[i];
        weapon.display();
        weapon.move();
        let hitSomething = false;

        for (let j = enemies.length - 1; j >= 0; j--) {
            if (weapon.hits(enemies[j])) {
                score += 100;
                enemies.splice(j, 1);
                hitSomething = true;
                break;
            }
        }

        // Supprimer la balle si elle touche un ennemi ou sort du canvas
        if (hitSomething || weapon.y < 0) {
            playerWeapons.splice(i, 1);
        }
    }
}


function handlePowerUps() {
    if (frameCount % 600 === 0) {  // Génère un bonus toutes les 10 secondes (à 60 FPS, cela équivaut à 600 frames)
        let powerUp = new PowerUp(random(width), 10);  // Assurez-vous que les bonus ne commencent pas hors du canvas
        powerUps.push(powerUp);
        console.log("Power-up spawned at x:", powerUp.x, "y:", powerUp.y); // Pour déboguer et confirmer la création
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.display();
        powerUp.move();

        // Vérifie si le joueur collecte le power-up
        if (dist(player.x, player.y, powerUp.x, powerUp.y) < (player.size / 2 + powerUp.size / 2)) {
            applyPowerUp();
            powerUps.splice(i, 1);  // Supprimer le bonus après la collecte
            console.log("Power-up collected"); // Confirmation de la collecte
        }
    }
}


function applyPowerUp() {
    tripleShotActive = true;
    console.log("Triple Shot Activated!");
    setTimeout(() => {
        tripleShotActive = false;
        console.log("Triple Shot Deactivated!");
    }, tripleShotDuration * 30);  // Dure 300 secondes
}


class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 60;
        this.size = 50;
        this.health = 100;
    }

    display() {
        imageMode(CENTER);
        image(playerImg, this.x, this.y, this.size, this.size);
    }

    move() {
        if (keyIsDown(LEFT_ARROW) && this.x > this.size / 2) this.x -= 5;
        if (keyIsDown(RIGHT_ARROW) && this.x < width - this.size / 2) this.x += 5;
    }

    loseHealth(amount) {
        this.health -= amount;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 100;
        this.speed = 2;
    }

    display() {
        imageMode(CENTER);
        image(enemyImg, this.x, this.y, this.size, this.size);
    }

    move() {
        this.y += this.speed;
    }

    hits(player) {
        let d = dist(this.x, this.y, player.x, player.y);
        return d < (this.size / 2 + player.size / 2);
    }
}

class Weapon {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.angle = angle;
    }

    display() {
        fill(0, 255, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        this.x += this.speed * sin(this.angle);
        this.y -= this.speed * cos(this.angle);
    }

    hits(enemy) {
        let distance = dist(this.x, this.y, enemy.x, enemy.y);
        return distance < (this.size / 2 + enemy.size / 2);
    }
}

class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20; // Vous pouvez ajuster cette taille en fonction de l'image
    }

    display() {
        imageMode(CENTER);
        image(tripleShotImg, this.x, this.y, this.size, this.size); // Affiche l'image du bonus
    }

    move() {
        this.y += 2; // Vitesse appropriée pour que le joueur puisse collecter le bonus
    }
}

function checkGameOver() {
    if (player.health <= 0) {
        gameOver();
    }
}

function gameOver() {
    noLoop();
    let pseudo = prompt("Game Over. Entrez votre pseudo pour enregistrer votre score:", "");
    if (pseudo) {
        saveScore(score, pseudo);
        showLeaderboard();
    }
    // Réinitialiser le jeu
    playerWeapons = [];
    loop(); // Redémarrer la boucle de jeu si nécessaire
}


function saveScore(score, pseudo) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ pseudo: pseudo, score: score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('scores', JSON.stringify(scores));
}

function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    let scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';
    scores.forEach(score => {
        let li = document.createElement('li');
        li.textContent = `${score.pseudo} - ${score.score}`;
        scoreList.appendChild(li);
    });
}

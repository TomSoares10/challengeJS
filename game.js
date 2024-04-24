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

function preload() {
    playerImg = loadImage('image/vaiseau.png');  // Assurez-vous que le chemin est correct
    enemyImg = loadImage('image/ennemi.png');    // Assurez-vous que le chemin est correct
}



function setup() {
    window.canvas = createCanvas(800, 600);
    initializeGame();
}


function initializeGame() {
    localStorage.clear();
    player = new Player();
    enemies = [];
    playerWeapons = [];
    powerUps = []; // Réinitialiser la liste des power-ups
    score = 0;
    enemySpeedMultiplier = 1;
    tripleShotActive = false; // S'assurer que le bonus triple tir est désactivé au début
    loop();
}

function draw() {
    background(220);
    player.display();
    player.move();
    handleEnemies();
    handleWeapons();
    handlePowerUps(); // Gérer les power-ups
    displayHUD();
    checkGameOver();
}



function displayHUD() {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    // Vérifiez si la santé est définie avant de l'afficher
    let healthDisplay = (player.health !== undefined && !isNaN(player.health)) ? player.health : 0;
    text(`Score: ${score}`, 10, 10);
    text(`Health: ${healthDisplay}`, 10, 40); // Affichage de la santé avec vérification
}


function mouseClicked() {
    if (playerWeapons.length < 5) {
        if (tripleShotActive) {
            // Tirer en trois directions
            playerWeapons.push(new Weapon(player.x, player.y - player.size / 2, 0)); // Directement en avant
            playerWeapons.push(new Weapon(player.x, player.y - player.size / 2, 5)); // Angle à droite
            playerWeapons.push(new Weapon(player.x, player.y - player.size / 2, -5)); // Angle à gauche
        } else {
            // Tir normal
            playerWeapons.push(new Weapon(player.x, player.y - player.size / 2, 0));
        }
    }
}


function adjustDifficulty() {
    if (score % 1000 === 0 && score > 0) {  // Chaque 1000 points, sauf à 0
        enemySpeedMultiplier += 0.1;  // Augmente la vitesse des ennemis
        console.log("Difficulty increased: Speed Multiplier = " + enemySpeedMultiplier);
    }
}

function handleEnemies() {
    let spawnRate = Math.max(30, 120 - Math.floor(score / 1000) * 10);  // Diminue l'intervalle de spawn avec le score
    if (frameCount % spawnRate === 0) {
        enemies.push(new Enemy(random(width), -10));
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].move();
        enemies[i].display();
        if (enemies[i].y > height) {
            enemies.splice(i, 1);
        } else if (enemies[i].hits(player)) {
            player.loseHealth(10);
            enemies.splice(i, 1);
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
                score += 100; // Augmenter le score
                hitSomething = true;
                break; // Sortir de la boucle après une collision
            }
        }

        // Supprimer simplement la balle si elle sort du canvas sans toucher un ennemi
        if (!hitSomething && weapon.y < 0) {
            playerWeapons.splice(i, 1); // Supprimer la balle
        }
    }
}

function gameOver() {
    noLoop();
    let pseudo = prompt("Game Over. Entrez votre pseudo pour enregistrer votre score:", "");
    if (pseudo) {
        saveScore(score, pseudo);
        showLeaderboard();  // Mise à jour immédiate du classement
    }
    gameOverAnimation();
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 60;
        this.size = 50; // Taille pour l'affichage du joueur
        this.health = 100; // Initialisation correcte de la santé
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
        if (this.health <= 0) {
            gameOver();
        }
    }
}



class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;  // Assurez-vous que cette taille correspond à la taille que vous voulez pour l'image
        this.speed = 2;  // Vitesse initiale
    }

    display() {
        imageMode(CENTER);
        image(enemyImg, this.x, this.y, this.size, this.size); // S'assure que l'image de l'ennemi est affichée
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
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.angle = angle; // Angle pour la direction de tir
    }

    display() {
        fill(0, 255, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        this.x += this.speed * sin(this.angle * (PI / 180)); // Conversion de degrés en radians
        this.y -= this.speed * cos(this.angle * (PI / 180));
    }

    // Méthode pour vérifier si cette arme touche un ennemi
    hits(enemy) {
        let distance = dist(this.x, this.y, enemy.x, enemy.y);
        return distance < (this.size / 2 + enemy.size / 2);
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

function saveScore(score, pseudo) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ pseudo: pseudo, score: score });
    scores.sort((a, b) => b.score - a.score); // Tri des scores en ordre décroissant
    localStorage.setItem('scores', JSON.stringify(scores));
}

function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    let scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = ''; // Nettoyer la liste existante

    scores.sort((a, b) => b.score - a.score); // Trier par score décroissant

    scores.forEach(score => {
        let li = document.createElement('li');
        li.textContent = `${score.pseudo} - ${score.score}`;
        scoreList.appendChild(li);
    });
}

class PowerUp {
    constructor() {
        this.x = random(width);
        this.y = -10; // Assurez-vous qu'ils apparaissent dans la zone visible
        this.size = 20;
    }

    display() {
        fill(0, 255, 0); // Utilisez une couleur distincte pour les identifier facilement
        ellipse(this.x, this.y, this.size, this.size);
    }

    move() {
        this.y += 2; // Vitesse appropriée pour que le joueur puisse les collecter
    }
}


function handlePowerUps() {
    if (frameCount % 600 === 0) {  // Apparaît toutes les 10 secondes
        powerUps.push(new PowerUp());
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.display();
        powerUp.move();

        // Vérifie si le joueur collecte le power-up
        if (dist(player.x, player.y, powerUp.x, powerUp.y) < (player.size / 2 + powerUp.size / 2)) {
            applyPowerUp();
            powerUps.splice(i, 1);  // Supprimer le bonus après la collecte
        }
    }
}


function applyPowerUp() {
    console.log("Triple Shot Activated!");
    tripleShotActive = true;
    setTimeout(() => {
        tripleShotActive = false;
        console.log("Triple Shot Deactivated!");
    }, tripleShotDuration * 16.67); // Multiplié par 16.67 pour convertir les millisecondes (approximativement 60 fps)
}


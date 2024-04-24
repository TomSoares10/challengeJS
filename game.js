let player;
let enemies = [];
let playerWeapons = [];
let gameOverFrames = 0;
let canvas;
let score = 0;
let enemySpeedMultiplier = 1;
let tripleShotActive = false;
let tripleShotDuration = 300;
let powerUps = [];
let playerImg, enemyImg, tripleShotImg, lifePlusImg, ammoBonusImg;
let initialAmmo = 30; // Munitions initiales

function preload() {
    playerImg = loadImage('image/vaiseau.png');
    enemyImg = loadImage('image/ennemi.png');
    tripleShotImg = loadImage('image/bonustripletir.png');
    lifePlusImg = loadImage('image/coeur.png');
    ammoBonusImg = loadImage('image/balleenplus.png');
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
    player.ammo = initialAmmo;
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
    checkAmmo();
}

function displayHUD() {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 10, 10);
    text(`Health: ${player.health}`, 10, 40);
    text(`Ammo: ${player.ammo}`, 10, 70);
}

function mouseClicked() {
    if (playerWeapons.length < 5 && player.ammo > 0) {
        if (!tripleShotActive) {
            player.ammo -= 1; // Réduit les munitions à chaque tir
        }
        shootWeapon();
    }
}

function shootWeapon() {
    if (tripleShotActive) {
        playerWeapons.push(new Weapon(player.x, player.y, 0));
        playerWeapons.push(new Weapon(player.x, player.y, radians(5)));
        playerWeapons.push(new Weapon(player.x, player.y, radians(-5)));
    } else {
        playerWeapons.push(new Weapon(player.x, player.y, 0));
    }
}

function handleEnemies() {
    if (frameCount % 120 === 0) {
        enemies.push(new Enemy(random(width), -30));
    }

    enemies.forEach((enemy, index) => {
        enemy.move();
        enemy.display();
        if (enemy.y > height) {
            player.loseHealth(10);
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

        if (!hitSomething && weapon.y < 0) {
            playerWeapons.splice(i, 1);
        }
    }
}

function handlePowerUps() {
    if (frameCount % 600 === 0) {
        let type = random(['life', 'ammo']);
        let powerUp = (type === 'life') ? new PowerUp(lifePlusImg, random(width), 10) : new PowerUp(ammoBonusImg, random(width), 10);
        powerUps.push(powerUp);
    }

    powerUps.forEach((powerUp, index) => {
        powerUp.display();
        powerUp.move();
        if (dist(player.x, player.y, powerUp.x, powerUp.y) < (player.size / 2 + powerUp.size / 2)) {
            if (powerUp.img === lifePlusImg) {
                player.health += 10;
            } else {
                player.ammo += 1;  // Ajoute une balle
            }
            powerUps.splice(index, 1);
        }
    });
}

function applyPowerUp() {
    tripleShotActive = true;
    setTimeout(() => {
        tripleShotActive = false;
    }, tripleShotDuration * 1000);
}

function checkAmmo() {
    if (player.ammo <= 0) {
        gameOver();
    }
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 60;
        this.size = 50;
        this.health = 100;
        this.ammo = initialAmmo;
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
    constructor(img, x, y) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.size = 20;
    }

    display() {
        imageMode(CENTER);
        image(this.img, this.x, this.y, this.size, this.size);
    }

    move() {
        this.y += 2;
    }
}

function gameOver() {
    noLoop();
    let pseudo = prompt("Game Over. Entrez votre pseudo pour enregistrer votre score:", "");
    if (pseudo) {
        saveScore(score, pseudo);
        showLeaderboard();
    }
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

function checkGameOver() {
    if (player.health <= 0 || player.ammo <= 0) {
        gameOver();
    }
}

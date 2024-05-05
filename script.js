document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startGame').addEventListener('click', () => {
        // Tentative de redémarrage simplifié pour p5.js
        if (window.canvas instanceof p5) {
            window.canvas.remove(); // Supprime l'instance de canvas p5 existante
        }
        new p5(); // Crée une nouvelle instance de jeu

        // Réinitialisation des variables et redémarrage de la boucle de jeu
        enemies = [];
        playerWeapons = [];
        loop(); // Assurez-vous que la boucle de dessin est relancée si elle a été arrêtée
    });
})

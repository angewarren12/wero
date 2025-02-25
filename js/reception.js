import config from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Récupérer les données de l'utilisateur depuis localStorage
        const userData = JSON.parse(localStorage.getItem('user_data'));
        
        if (!userData) {
            console.error('Aucune donnée utilisateur trouvée');
            window.location.href = 'index.html';
            return;
        }

        // Afficher les informations de l'utilisateur
        const userNameElement = document.getElementById('userName');
        const montantElement = document.getElementById('montant');
        const codeElement = document.getElementById('codeId');
        const userNameSpan = document.querySelector('.user-name');

        if (userNameElement) userNameElement.textContent = `${userData.prenom} ${userData.nom}`;
        if (montantElement) montantElement.textContent = `${userData.montant.toFixed(2)} €`;
        if (codeElement) codeElement.textContent = `ID: ${userData.code}`;
        if (userNameSpan) userNameSpan.textContent = `${userData.prenom} ${userData.nom}`;

        // Gérer le clic sur le bouton continuer
        const continueButton = document.getElementById('continueButton');
        if (continueButton) {
            continueButton.addEventListener('click', function() {
                console.log('Redirection vers pays.html');
                window.location.href = 'pays.html';
            });
        } else {
            console.error('Bouton continuer non trouvé');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

// Données de test (à remplacer par une API)
// const testData = [
//     {
//         code: '5W7-8A5',
//         nom: 'Dupont',
//         prenom: 'Jean',
//         montant: 1500.00
//     }
// ];

import config from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const errorMessage = document.getElementById('error-message');

    // Charger les données depuis l'API
    fetch(`${config.apiUrl}/users`)
        .then(response => response.json())
        .then(data => {
            // Stocker les données dans une variable
            window.userData = data;
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données:', error);
        });

    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const codeDigital = this.elements['codeDigital'].value;
        const telephone = this.elements['telephone'].value;

        // Vérification des données
        const userData = window.userData.find(user => user.code === codeDigital);

        if (userData) {
            // Stocker les données dans localStorage
            const sessionData = {
                code: userData.code,
                telephone: telephone,
                nom: userData.nom,
                prenom: userData.prenom,
                montant: userData.montant,
                verification_time: new Date().toISOString()
            };
            localStorage.setItem('user_data', JSON.stringify(sessionData));

            // Redirection vers la page de réception
            window.location.href = 'reception.html';
        } else {
            errorMessage.textContent = 'Code digital ou numéro de téléphone incorrect';
            errorMessage.style.display = 'block';
        }
    });
});

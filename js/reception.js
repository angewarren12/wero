document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les données de l'utilisateur depuis localStorage
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }

    // Afficher les informations de l'utilisateur
    document.getElementById('userName').textContent = `${userData.prenom} ${userData.nom}`;
    document.getElementById('montant').textContent = `${userData.montant.toFixed(2)} €`;
    document.getElementById('codeId').textContent = `ID: ${userData.code}`;
    document.querySelector('.user-name').textContent = `${userData.prenom} ${userData.nom}`;

    // Gérer le clic sur le bouton continuer
    document.getElementById('continueButton').addEventListener('click', function() {
        window.location.href = 'pays.html';
    });
});

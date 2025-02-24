document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est authentifié et a rempli toutes les étapes
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData || !userData.pays || !userData.info_bancaire || !userData.banque) {
        window.location.href = 'index.html';
        return;
    }
});

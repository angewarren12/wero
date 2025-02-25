const fs = require('fs').promises;
const path = require('path');

function generateCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 2) code += '-';
    }
    return code;
}

export default async function handler(req, res) {
    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer les requêtes OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const dataPath = path.join(process.cwd(), 'data.json');
    
    try {
        // Lire le fichier data.json
        let data = [];
        try {
            const fileContent = await fs.readFile(dataPath, 'utf8');
            data = JSON.parse(fileContent);
        } catch (error) {
            // Si le fichier n'existe pas ou est vide, créer un tableau vide
            await fs.writeFile(dataPath, '[]');
        }

        if (req.method === 'GET') {
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const newUser = JSON.parse(req.body);
            let code;
            do {
                code = generateCode();
            } while (data.some(user => user.code === code));

            newUser.code = code;
            newUser.derniere_modification = new Date().toISOString();
            data.push(newUser);
            await fs.writeFile(dataPath, JSON.stringify(data, null, 4));
            return res.status(201).json(newUser);
        }

        if (req.method === 'PUT') {
            const { code } = req.query;
            const updates = JSON.parse(req.body);
            const userIndex = data.findIndex(user => user.code === code);
            
            if (userIndex === -1) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            data[userIndex] = { ...data[userIndex], ...updates };
            await fs.writeFile(dataPath, JSON.stringify(data, null, 4));
            return res.status(200).json(data[userIndex]);
        }

        if (req.method === 'DELETE') {
            const { code } = req.query;
            const initialLength = data.length;
            data = data.filter(user => user.code !== code);
            
            if (data.length === initialLength) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            await fs.writeFile(dataPath, JSON.stringify(data, null, 4));
            return res.status(200).json({ message: 'Utilisateur supprimé' });
        }

        return res.status(405).json({ error: 'Méthode non autorisée' });
    } catch (error) {
        console.error('Erreur:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

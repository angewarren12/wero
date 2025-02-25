const fs = require('fs');
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
    const dataPath = path.join(process.cwd(), 'data.json');
    
    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer les requêtes OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Lire le fichier data.json
        let data = [];
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            // Si le fichier n'existe pas ou est vide, utiliser un tableau vide
            fs.writeFileSync(dataPath, '[]');
        }

        switch (req.method) {
            case 'GET':
                res.status(200).json(data);
                break;

            case 'POST':
                const newUser = req.body;
                let code;
                do {
                    code = generateCode();
                } while (data.some(user => user.code === code));

                newUser.code = code;
                newUser.derniere_modification = new Date().toISOString();
                data.push(newUser);
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
                res.status(201).json(newUser);
                break;

            case 'PUT':
                const userCode = req.query.code;
                const updates = req.body;
                const userIndex = data.findIndex(user => user.code === userCode);
                
                if (userIndex === -1) {
                    res.status(404).json({ error: 'Utilisateur non trouvé' });
                    return;
                }

                data[userIndex] = { ...data[userIndex], ...updates };
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
                res.status(200).json(data[userIndex]);
                break;

            case 'DELETE':
                const codeToDelete = req.query.code;
                const initialLength = data.length;
                data = data.filter(user => user.code !== codeToDelete);
                
                if (data.length === initialLength) {
                    res.status(404).json({ error: 'Utilisateur non trouvé' });
                    return;
                }

                fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
                res.status(200).json({ message: 'Utilisateur supprimé' });
                break;

            default:
                res.status(405).json({ error: 'Méthode non autorisée' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

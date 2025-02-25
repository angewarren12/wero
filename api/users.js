import { promises as fs } from 'fs';
import path from 'path';

// Fonction pour générer un code unique
function generateUniqueCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const code1 = Array(3).fill().map(() => letters[Math.floor(Math.random() * letters.length)]).join('');
    const code2 = Array(3).fill().map(() => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    return `${code1}-${code2}`;
}

let data = [];

// Fonction pour lire les données
async function readData() {
    try {
        const filePath = path.join(process.cwd(), 'data.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
        return [];
    }
}

// Fonction pour écrire les données
async function writeData(data) {
    try {
        const filePath = path.join(process.cwd(), 'data.json');
        await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf8');
    } catch (error) {
        console.error('Erreur lors de l\'écriture du fichier:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer les requêtes OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Lire les données au début de chaque requête
        data = await readData();

        if (req.method === 'GET') {
            // Si un code est fourni, retourner l'utilisateur spécifique
            const userCode = req.query.code;
            if (userCode) {
                const user = data.find(u => u.code === userCode);
                if (!user) {
                    return res.status(404).json({ error: 'Utilisateur non trouvé' });
                }
                return res.status(200).json(user);
            }
            // Sinon retourner tous les utilisateurs
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const newUser = {
                ...req.body,
                code: generateUniqueCode(),
                derniere_modification: new Date().toISOString()
            };

            data.push(newUser);
            await writeData(data);
            return res.status(201).json(newUser);
        }

        if (req.method === 'DELETE') {
            const userCode = req.query.code;
            if (!userCode) {
                return res.status(400).json({ error: 'Code utilisateur requis' });
            }

            const userIndex = data.findIndex(u => u.code === userCode);
            if (userIndex === -1) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            data.splice(userIndex, 1);
            await writeData(data);
            return res.status(200).json({ message: 'Utilisateur supprimé' });
        }

        // Méthode non supportée
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });

    } catch (error) {
        console.error('Erreur serveur:', error);
        return res.status(500).json({ 
            error: 'Erreur serveur',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

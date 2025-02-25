import { connectToDatabase } from '../lib/mongodb';

// Fonction pour générer un code unique
function generateUniqueCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const code1 = Array(3).fill().map(() => letters[Math.floor(Math.random() * letters.length)]).join('');
    const code2 = Array(3).fill().map(() => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    return `${code1}-${code2}`;
}

// Fonction pour logger les erreurs
function logError(method, error, additionalInfo = {}) {
    console.error('=== ERREUR API ===');
    console.error('Méthode:', method);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Info additionnelle:', JSON.stringify(additionalInfo, null, 2));
    console.error('==================');
}

// Fonction pour logger les requêtes
function logRequest(method, path, body = null) {
    console.log('=== REQUÊTE API ===');
    console.log('Méthode:', method);
    console.log('Chemin:', path);
    if (body) {
        console.log('Corps:', JSON.stringify(body, null, 2));
    }
    console.log('==================');
}

export default async function handler(req, res) {
    logRequest(req.method, req.url, req.body);

    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer les requêtes OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('Connexion à MongoDB...');
        const { db } = await connectToDatabase();
        const collection = db.collection('users');
        console.log('Connecté à MongoDB');

        if (req.method === 'GET') {
            const userCode = req.query.code;
            console.log('GET - Code recherché:', userCode);
            
            if (userCode) {
                const user = await collection.findOne({ code: userCode });
                if (!user) {
                    console.log('Utilisateur non trouvé:', userCode);
                    return res.status(404).json({ error: 'Utilisateur non trouvé' });
                }
                console.log('Utilisateur trouvé:', user);
                return res.status(200).json(user);
            }

            const users = await collection.find({}).toArray();
            console.log(`${users.length} utilisateurs trouvés`);
            return res.status(200).json(users);
        }

        if (req.method === 'POST') {
            console.log('POST - Données reçues:', req.body);
            
            if (!req.body) {
                console.error('POST - Corps de requête vide');
                return res.status(400).json({ error: 'Corps de requête requis' });
            }

            const newUser = {
                ...req.body,
                code: generateUniqueCode(),
                derniere_modification: new Date().toISOString()
            };
            console.log('Nouvel utilisateur à créer:', newUser);

            await collection.insertOne(newUser);
            console.log('Utilisateur créé avec succès');
            return res.status(201).json(newUser);
        }

        if (req.method === 'DELETE') {
            const userCode = req.query.code;
            console.log('DELETE - Code à supprimer:', userCode);
            
            if (!userCode) {
                return res.status(400).json({ error: 'Code utilisateur requis' });
            }

            const result = await collection.deleteOne({ code: userCode });
            if (result.deletedCount === 0) {
                console.log('Utilisateur non trouvé pour suppression:', userCode);
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }

            console.log('Utilisateur supprimé avec succès');
            return res.status(200).json({ message: 'Utilisateur supprimé' });
        }

        console.log('Méthode non supportée:', req.method);
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });

    } catch (error) {
        logError(req.method, error, { 
            url: req.url,
            body: req.body,
            query: req.query
        });
        
        return res.status(500).json({ 
            error: 'Erreur serveur',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}

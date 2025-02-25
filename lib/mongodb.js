import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
    throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
}

if (!MONGODB_DB) {
    throw new Error('Veuillez définir la variable d\'environnement MONGODB_DB');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
    // Si nous avons déjà une connexion, utilisons-la
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    // Si pas de connexion, créons-en une nouvelle
    const client = await MongoClient.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = await client.db(MONGODB_DB);

    // Mettons en cache la connexion
    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier data.json
const dataPath = path.join(__dirname, '../data.json');

// Fonction pour lire le fichier data.json
const readData = () => {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la lecture des données:', error);
    return [];
  }
};

// Fonction pour écrire dans le fichier data.json
const writeData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'écriture des données:', error);
    return false;
  }
};

// Fonction pour générer un code unique
const generateCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(Math.random() * 10)}-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Gérer les requêtes OPTIONS (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // GET /api/users - Récupérer tous les utilisateurs
    if (event.httpMethod === 'GET') {
      const data = readData();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // POST /api/users - Ajouter un nouvel utilisateur
    if (event.httpMethod === 'POST') {
      const data = readData();
      const newUser = JSON.parse(event.body);
      
      // Générer un code unique
      let code;
      do {
        code = generateCode();
      } while (data.some(user => user.code === code));

      const user = {
        code,
        ...newUser,
        derniere_modification: new Date().toISOString()
      };

      data.push(user);
      writeData(data);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(user)
      };
    }

    // DELETE /api/users/{code} - Supprimer un utilisateur
    if (event.httpMethod === 'DELETE') {
      const code = event.path.split('/').pop();
      const data = readData();
      const index = data.findIndex(user => user.code === code);

      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Utilisateur non trouvé' })
        };
      }

      data.splice(index, 1);
      writeData(data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Utilisateur supprimé avec succès' })
      };
    }

    // PUT /api/users/{code} - Mettre à jour un utilisateur
    if (event.httpMethod === 'PUT') {
      const code = event.path.split('/').pop();
      const updates = JSON.parse(event.body);
      const data = readData();
      const index = data.findIndex(user => user.code === code);

      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Utilisateur non trouvé' })
        };
      }

      data[index] = {
        ...data[index],
        ...updates,
        derniere_modification: new Date().toISOString()
      };

      writeData(data);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data[index])
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur interne du serveur' })
    };
  }
};

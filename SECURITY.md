# Sécurité — FlowBoard

Ce fichier liste les actions de sécurité recommandées pour ce dépôt.

1. Secrets

- Ne commitez jamais de secrets (JWT secrets, mots de passe DB, clés API).
- Utilisez des fichiers `.env` listés dans `.gitignore` en développement et `secret managers` en production (Vault, Azure Key Vault, AWS Secrets Manager).
- Créez un fichier `backend/.env` à partir de `backend/.env.example` et ne le commitez pas.

2. Auth & autorisation

- Protégez les endpoints privés avec JWT et vérifiez l'autorisation (ownership des boards).
- N'exposez pas les endpoints qui retournent des données utilisateurs sans authentification.

3. Réseau & infrastructure

- Ne mappez pas le port Postgres (`5432`) vers l'hôte en production. Gardez la DB sur le réseau interne du cluster.
- Utilisez TLS pour toutes les connexions externes (API, DB si possible).

4. Backend

- Activez des headers de sécurité (utilisez `helmet` pour Express).
- Limitez la taille des payloads : `express.json({ limit: '10kb' })` ou selon besoin.
- Ajoutez un middleware global d'erreurs et un logger structuré (pino/winston).
- Authentifiez les connexions Socket.io (par ex. via token lors de la handshake).

5. Frontend

- Ne stockez pas de tokens sensibles dans `localStorage` si possible — préférez des cookies `HttpOnly`/`Secure`/`SameSite`.
- Validez/assainissez tout contenu utilisateur affiché. Evitez `dangerouslySetInnerHTML`.

6. Dépendances et CI

- Activez Dependabot ou équivalent pour updates automatiques.
- Ajoutez `npm audit` et lint dans la pipeline CI (ex: GitHub Actions) et échouez la build sur vulnérabilités critiques.

7. Docker & déploiement

- En production, utilisez des Dockerfiles multi-stage et lancez le service en tant qu'utilisateur non-root.
- Ne mappez pas les volumes sources et node_modules en production.

Commandes utiles

```
# Générer un .env local à partir de l'exemple (exécuter localement)
cp backend/.env.example backend/.env

# Vérifier l'absence de secrets routinièrement
git grep -n "JWT_SECRET\|POSTGRES_PASSWORD\|DB_PASS" || true

# Lancer un audit rapide pour backend
cd backend && npm i --package-lock-only && npm audit --audit-level=moderate
```

Pour toute question ou pour que j'applique automatiquement des changements (ex: middleware d'auth, CI), demande et je m'en occupe.

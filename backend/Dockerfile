## Production-ready Dockerfile (multi-stage)
## Fait par Cl@udiu — image non-root, dépendances installées proprement

FROM node:20-alpine AS builder
WORKDIR /app

# Installer les dépendances de production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copier le code source
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S app && adduser -S app -G app

# Copier depuis l'étape builder
COPY --from=builder /app .

ENV NODE_ENV=production

# Donner la propriété des fichiers à l'utilisateur non-root
RUN chown -R app:app /app
USER app

EXPOSE 4000

# Démarrer l'application
CMD ["node", "src/server.js"]

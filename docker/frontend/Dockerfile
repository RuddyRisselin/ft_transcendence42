# Utiliser Node.js comme base
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et installer les dépendances
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install && npm install chart.js

# Copier tout le projet
COPY ./frontend ./

# 🛠️ Construire le projet (c'est ici que le build doit se faire)
RUN npm run build

# Lancer un serveur statique (Vite preview)
CMD ["npx", "vite", "preview", "--host"]

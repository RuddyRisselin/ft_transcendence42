FROM node:20-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/srcs ./srcs
CMD ["node", "srcs/server.js"]

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# Clean install to ensure platform-specific binaries (especially for sharp)
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]

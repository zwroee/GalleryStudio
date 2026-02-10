FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY package*.json ./
# Install dependencies for sharp (and use npm install to ensure platform binaries are correct)
RUN apk add --no-cache python3 make g++ vips-dev
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]

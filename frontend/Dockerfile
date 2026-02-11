FROM node:18-alpine AS builder

WORKDIR /app

# Accept build argument for demo mode
ARG VITE_DEMO_MODE=false
ENV VITE_DEMO_MODE=${VITE_DEMO_MODE}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

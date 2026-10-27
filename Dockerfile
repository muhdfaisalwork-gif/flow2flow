# ============================================================================
# Stage 1: Build the Shadow Flow SPA Bundle
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ============================================================================
# Stage 2: Production Nginx Runtime (OCI / GitHub Container Registry)
# ============================================================================
FROM nginx:1.27-alpine

# GitHub Container Registry (ghcr.io) Pre-Defined OCI Annotation Keys
LABEL org.opencontainers.image.source=https://github.com/muhdfaisalwork-gif/flow2flow
LABEL org.opencontainers.image.description="Shadow Flow — Apache 2.0 Open-Source AI Workflow Automation Platform with Universal n8n Importer, 128+ Templates & AI Copilot"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Configure Nginx for SPA routing (/index.html fallback)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

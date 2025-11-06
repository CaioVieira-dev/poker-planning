# ============================================
# Stage 1: Install Dependencies
# ============================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Instale o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie o package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instale todas as dependências (incluindo devDependencies para o build)
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build Backend (TypeScript)
# ============================================
FROM node:22-alpine AS backend-builder

WORKDIR /app

# Instale o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie as dependências instaladas
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./

# Copie os arquivos necessários para compilar o backend
COPY src/backend ./src/backend
COPY src/shared ./src/shared
COPY tsconfig.backend.json ./tsconfig.backend.json

# Compile o TypeScript do backend
RUN pnpm run build:backend

# ============================================
# Stage 3: Build Frontend (Vite)
# ============================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Instale o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie as dependências instaladas
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./

# Copie os arquivos do frontend e shared
COPY src/frontend ./src/frontend
COPY src/shared ./src/shared
COPY vite.config.ts ./vite.config.ts
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.node.json ./tsconfig.node.json

# Build do Vite
RUN pnpm run build:frontend

# ============================================
# Stage 4: Production - Nginx + Node
# ============================================
FROM node:22-alpine

# Instale o Nginx, Supervisor e pnpm
RUN apk add --no-cache nginx supervisor && \
    corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copie o package.json e instale apenas dependências de produção
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copie o backend compilado (TypeScript → JavaScript)
# Com rootDir: "./src", o output será dist/backend/ e dist/shared/
COPY --from=backend-builder /app/dist ./dist

# Copie o frontend buildado (Vite gera em src/frontend/dist)
COPY --from=frontend-builder /app/src/frontend/dist /usr/share/nginx/html

# Crie a configuração do Nginx
RUN mkdir -p /run/nginx

# Configuração do Nginx
RUN cat > /etc/nginx/http.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend (arquivos estáticos)
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Configuração do Supervisor
RUN cat > /etc/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root

[program:nginx]
command=/usr/sbin/nginx -g 'daemon off;'
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:backend]
command=node dist/backend/server.js
directory=/app
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=NODE_ENV=production
EOF

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

# ============================================
# Stage 1: Install Dependencies
# ============================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Instale o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie o package.json e pnpm-lock.yaml
COPY src/package.json src/pnpm-lock.yaml* ./

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
COPY src/backend ./backend
COPY src/tsconfig.backend.json ./tsconfig.backend.json

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

# Copie os arquivos do frontend
COPY src/frontend ./frontend
COPY src/vite.config.ts ./vite.config.ts
COPY src/tsconfig.json ./tsconfig.json
COPY src/tsconfig.app.json ./tsconfig.app.json
COPY src/tsconfig.node.json ./tsconfig.node.json
COPY src/index.html ./index.html

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
COPY src/package.json src/pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copie o backend compilado (TypeScript → JavaScript)
COPY --from=backend-builder /app/dist/backend ./dist/backend

# Copie o frontend buildado
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

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

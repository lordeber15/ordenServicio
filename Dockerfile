# ── Etapa 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Etapa 2: Servidor nginx ────────────────────────────────────────
FROM nginx:alpine

# Copiar build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Vite preserva los permisos originales de los archivos en public/ al copiarlos
# a dist/; si alguno queda sin permiso de lectura para "otros", nginx (que corre
# como usuario no-root) responde 403 en vez de servirlo. Se normaliza acá para
# no depender de los permisos del filesystem de origen.
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; \
    && find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Copiar config nginx con try_files para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

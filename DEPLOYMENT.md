# Deployment Guide

## VPS Setup (Ubuntu/Debian)

### 1. Preparar VPS
```bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clonar y ejecutar
```bash
git clone <tu-repo> kanban
cd kanban
docker-compose up -d
```

**App está en**: `http://tu-vps.com:3000`

### 3. (Opcional) Reverse Proxy con Nginx

Crear `/etc/nginx/sites-available/kanban`:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/kanban /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## Comandos útiles

```bash
# Logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Actualizar imagen
docker-compose pull
docker-compose up -d

# Eliminar volumen (CUIDADO — pierde datos)
docker volume rm kanban_kanban_data
```

## Data Backup

La BD está en `./data/kanban.db` (bind mount local). Para respaldar:

```bash
# Backup
tar -czf kanban-backup-$(date +%Y%m%d).tar.gz data/

# Restore
tar -xzf kanban-backup-20260327.tar.gz
```

## Monitoreo

El health check corre cada 30s. Ver estado:
```bash
docker ps | grep kanban-app
```

Debe mostrar status `(healthy)` o `(starting)`.

## Escalado futuro

Si crece el uso:
- **Separar frontend y backend** en dos servicios Docker
- **Cambiar SQLite a PostgreSQL** para mejor concurrencia
- **Usar Redis** para caché/sesiones
- **CDN** para assets estáticos

Todos estos cambios se hacen fácilmente con Docker Compose.

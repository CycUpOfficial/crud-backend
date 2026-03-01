# Deployment (CSC cPouta)

This guide deploys the API on a cPouta VM using Docker Compose and stores uploads locally on the server.

## 1) VM setup (cPouta)

- Create an Ubuntu 22.04+ VM.
- Open inbound ports: 22 (SSH), 80 and 443 (HTTP/HTTPS).

Install Docker:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in to apply Docker group changes.

## 2) Project files on the VM

Copy these files to the VM:
- docker-compose.prod.yml
- Dockerfile.prod
- Caddyfile
- .env (production values)
- source code

## 3) Production .env template

```dotenv
NODE_ENV=production
PORT=8000
TRUST_PROXY=true

# Database
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db:5432/app_db
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=app_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB
MONGO_URI=mongodb://mongo:27017/cycup

# Mail
SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USER
SMTP_PASS=YOUR_SMTP_PASS
MAIL_FROM=no-reply@cycup.com

# Frontend + CORS
FRONTEND_URL=http://YOUR_VM_PUBLIC_IP
CORS_ORIGINS=http://YOUR_VM_PUBLIC_IP

# Storage (Local)
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=uploads
STORAGE_LOCAL_URL=/uploads

# Cookies
COOKIE_NAME=session
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

## 4) Run

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The API will be available on:
- http://YOUR_VM_PUBLIC_IP

## 5) Optional HTTPS

You do not have a domain yet, so Caddy will serve HTTP only.
When you have a domain, update `Caddyfile` like this:

```
example.com {
    encode gzip
    reverse_proxy api:8000
}
```

Then set:
- `FRONTEND_URL=https://example.com`
- `CORS_ORIGINS=https://example.com`
- `COOKIE_SECURE=true`

Reload Caddy:

```bash
docker compose -f docker-compose.prod.yml up -d --build caddy
```

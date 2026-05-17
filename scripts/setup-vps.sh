#!/bin/bash
set -e

echo "=== Race War VPS Setup ==="

# Install Docker
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Install Docker Compose plugin (if not bundled)
if ! docker compose version &> /dev/null; then
  echo "Installing Docker Compose plugin..."
  apt-get update && apt-get install -y docker-compose-plugin
fi

# Clone repo
if [ ! -d /opt/race-war ]; then
  echo "Cloning repository..."
  git clone https://github.com/aluizio-n/race-war.git /opt/race-war
fi

cd /opt/race-war

# Create uploads directory
mkdir -p backend/uploads/avatars

# Create production .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from template..."
  JWT_SECRET=$(openssl rand -hex 32)
  PG_PASSWORD=$(openssl rand -hex 16)

  cat > .env <<EOF
POSTGRES_USER=racewar
POSTGRES_PASSWORD=${PG_PASSWORD}
POSTGRES_DB=racewar

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=30

BCRYPT_ROUNDS=12
CORS_ORIGIN=*

VAPID_EMAIL=admin@racewar.app
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
EOF

  echo ""
  echo "=== .env created with secure random credentials ==="
  echo "Postgres password: ${PG_PASSWORD}"
  echo "JWT secret: ${JWT_SECRET}"
  echo ""
  echo "Edit /opt/race-war/.env to set CORS_ORIGIN and VAPID keys."
fi

# Create nginx certs directory
mkdir -p nginx/certs

# Start services
echo "Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "=== Setup complete ==="
echo "API running at http://$(hostname -I | awk '{print $1}'):80"
echo "Health: curl http://localhost/health"

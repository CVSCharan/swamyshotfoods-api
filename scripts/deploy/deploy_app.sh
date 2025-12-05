#!/bin/bash

# Exit on error
set -e

APP_DIR="/var/www/swamyshotfoods-api"
PM2_APP_NAME="swamyshotfoods-api"

# Ensure we are in the app directory
if [ ! -d "$APP_DIR" ]; then
  echo "Error: App directory $APP_DIR does not exist."
  echo "Please clone the repository to $APP_DIR first."
  exit 1
fi

cd "$APP_DIR"

echo "Deploying application..."

# 1. Pull latest code
echo "Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "Installing dependencies..."
npm install

# 3. Build the project
echo "Building TypeScript project..."
npm run build

# 4. Restart Application
echo "Restarting PM2 process..."
# Check if app is running, if not start it, else reload
if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 reload "$PM2_APP_NAME"
else
    pm2 start dist/server.js --name "$PM2_APP_NAME"
fi

# 5. Save PM2 list
pm2 save

echo "Deployment successful!"

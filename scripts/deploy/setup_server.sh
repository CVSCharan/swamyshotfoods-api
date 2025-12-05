#!/bin/bash

# Exit on error
set -e

echo "Starting server setup..."

# 1. Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (v20)
echo "Installing Node.js v20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# Verify Node installation
node -v
npm -v

# 3. Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# 4. Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# 5. Configure Firewall (UFW)
echo "Configuring Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
# Enable UFW if not already enabled (be careful not to lock yourself out, SSH is allowed above)
echo "y" | sudo ufw enable

# 6. Setup complete
echo "Server setup complete! Next steps:"
echo "1. Configure Nginx with your domain/IP."
echo "2. Set up your environment variables."
echo "3. Deploy your application code."

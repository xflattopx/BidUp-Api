# https://hub.docker.com/_/node
FROM node:18-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# RUN npm ci --only=production
RUN npm ci

# Copy local code to the container image.
COPY . ./

# Run the web service on container startup.
CMD [ "node", "./bin/www" ]

ENV PORT=8080

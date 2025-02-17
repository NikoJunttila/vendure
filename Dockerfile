# Dockerfile
FROM node:20-alpine

# Install dependencies required for building native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Create app directory and set permissions
WORKDIR /home/node/app
RUN mkdir -p node_modules

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application source code and compile
COPY . .
RUN npm run build

# Expose the port for the Vendure server
EXPOSE 3000
ENV PORT=3000

# Default command (can be overridden)
CMD ["npm", "run", "start:server"]
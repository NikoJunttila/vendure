# Stage 1: Builder
FROM node:20 AS builder
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci

# Copy source files and configuration
COPY ["tsconfig.json","./"]
COPY "./static/email/templates/" "./static/email/templates/"
COPY "./src/" "./src/"

# Ensure the email partials directory exists (even if empty)
RUN mkdir -p static/email/templates/partials

# Build the Vendure application (this may normally build admin‑ui too, but it will be overridden)
RUN npm run build && npm prune --omit=dev

# Stage 2: Production Image
FROM node:20-slim AS prod
WORKDIR /usr/src/app

# Install utilities (curl & wget) for health checking
RUN apt update && apt install -y curl wget

# Copy built files and dependencies from builder stage
COPY --from=builder ["/usr/src/app/static/", "./static/"]
COPY --from=builder ["/usr/src/app/dist/", "./dist/"]
COPY --from=builder ["/usr/src/app/node_modules/", "./node_modules/"]

# Re-create the email partials directory in case it was removed
RUN mkdir -p /usr/src/app/static/email/templates/partials

# Stage 3: Server Container
FROM prod AS server
# Vendure will serve the admin‑ui from /usr/src/app/admin-ui
# This folder will be provided by a host volume mount
ENTRYPOINT ["node", "dist/index.js"]

# Stage 4: Worker Container
FROM prod AS worker

ENTRYPOINT ["node", "dist/index-worker.js"]

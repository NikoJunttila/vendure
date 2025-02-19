FROM node:20 AS builder
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]
RUN npm ci

COPY ["./tsconfig.json", "./"]
COPY "./static/email/templates/" "./static/email/templates/"
COPY "./src/" "./src/"
# Could do other dev related stuff between the pruning
RUN npm run build && npm prune --omit=dev
COPY "./admin-ui/" "./src/"
# used alpine image before but that breaks the entire app due to musl vs. glibc
FROM node:20-slim AS prod
WORKDIR /usr/src/app
# We want curl & wget for health-checking
RUN apt update && apt install -y curl wget
COPY --from=builder ["/usr/src/app/static/", "./dist/static/"]
COPY --from=builder ["/usr/src/app/dist/", "./dist/"]
COPY --from=builder ["/usr/src/app/node_modules/", "./node_modules/"]

FROM prod AS server
EXPOSE 3000
ENTRYPOINT ["node", "dist/src/index.js"]

FROM prod AS worker
EXPOSE 3020
ENTRYPOINT ["node", "dist/src/index-worker.js"]
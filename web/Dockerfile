# Single-stage build/run image for the Next.js app.
# Kept deliberately simple (no standalone output) so the better-sqlite3 native
# module and the TS next.config are always present at runtime.
FROM node:22-bookworm-slim
WORKDIR /app

# Toolchain for better-sqlite3's native build.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so the client base URL has to
# be known here, not just at runtime.
ARG NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "start"]

FROM node:22-alpine
# Pinned pnpm, installed directly - Node no longer bundles corepack and it's
# deprecated upstream. Keep this version in sync with package.json's
# "packageManager" field.
RUN npm install -g pnpm@10.33.0
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]

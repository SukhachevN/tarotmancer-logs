FROM node:18-alpine AS base
FROM base AS build
ARG branch_name
WORKDIR /app
RUN npm install -g pnpm
COPY package.json .
RUN pnpm install
COPY . .
RUN pnpm run build

FROM base AS run

WORKDIR /app
COPY --from=build /app/dist/ /app/dist/
COPY package.json .
COPY vite.config.ts .
RUN npm i -g serve

EXPOSE 8080

CMD [ "serve","-p", "8080", "-s", "dist" ]

# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=development \
    VITE_API_URL=http://13.232.176.236:8000

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5173"]

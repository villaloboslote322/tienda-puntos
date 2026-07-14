FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
COPY prisma ./prisma

RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start"]

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Expose port
EXPOSE 3001

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev"]

FROM node:20-alpine

WORKDIR /app

# Dependencias de compilacion para bcrypt en Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]

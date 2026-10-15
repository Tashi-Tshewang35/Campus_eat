FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]

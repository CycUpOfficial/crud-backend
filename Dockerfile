FROM node:20-alpine

ARG PORT=3000

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE ${PORT}

CMD ["npm", "start"]
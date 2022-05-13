
FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY . .

USER node

CMD ["npm","run","start"]

EXPOSE 5000



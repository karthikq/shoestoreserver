
FROM node:lts-alpine

WORKDIR /app

# ENV PORT=5000

COPY package*.json ./
RUN npm install 

COPY . .

USER node

CMD ["npm","run","start"]

 




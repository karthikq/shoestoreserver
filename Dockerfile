
FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV="production"

COPY package*.json ./
RUN npm install 

COPY . .

USER node

CMD ["npm","run","start"]

EXPOSE $PORT




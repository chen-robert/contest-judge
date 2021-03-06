FROM node:10

RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production 

COPY . .

ENV NODE_ENV production

CMD "./docker.sh"

FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY src /app/src

# check files list
RUN ls -a

RUN npm install


CMD [ "node", "./build/index.js" ]
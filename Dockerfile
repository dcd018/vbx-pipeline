FROM node:alpine

RUN groupadd -r nodejs && useradd -m -r -g -s /bin/bash nodejs nodejs

WORKDIR /home/nodejs/app

COPY package.json .
RUN npm install --production
COPY . .

ENV NODE_ENV production

CMD [“npm”, “start”]
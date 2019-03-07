FROM node:10-alpine
COPY . /app
WORKDIR /app
RUN npm i -g ts-node && npm i
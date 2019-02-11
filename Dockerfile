FROM node:10
ADD . /app
WORKDIR /app
RUN npm i
CMD ["npm", "run", "start"]
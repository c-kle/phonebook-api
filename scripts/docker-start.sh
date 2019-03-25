#!/bin/sh

if [ "$1" = "-w" ]
then
  echo "starting server in watch mode..."
  docker-compose run --rm --service-ports -v $(pwd):/app api npm run start:watch;
else
  echo "starting server ..."
  docker-compose run --rm --service-ports -v $(pwd):/app api npm run start;
fi
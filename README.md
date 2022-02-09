
# AutoMUKit API

---
## Requirements

You will need node & npm installed in your environment.

## Installation

    $ npm install

## Running tests

    $ npm test

## Running in development (watches file changes)

    $ npm run dev

## Running in production (manual build & start)

    $ npm install
    $ npm run build
    $ npm start

## Running in production (using flock and cron)

    $ crontab -e
    $ * * * * *       cd /path/to/automukit_api && ./start.sh 

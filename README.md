
# AutoMUKit API

---
## Requirements

You will need node & npm installed in your environment.

## Installation

    $ cp .env.example .env
    $ npm install

## Configuration (.env file)

    SERVER_PORT - The port number for the express server
    BASE_URL - The base url string for the web UI (used for script and css paths)
    PRECISION - The max precision number in digits (amount of decimals) for result numbers
    DEBUG - More verbose console output boolean (true | false)

## Running tests

    $ npm test

## Running in development (watches file changes)

    $ npm run dev

## Web UI for development

    Browse to http://localhost:3040 (the number is the SERVER_PORT in the .env file)

## Running in production (manual build & start)

    $ npm install
    $ npm run build
    $ npm start

## Running in production (using flock and cron)

    $ crontab -e
    * * * * *       cd /path/to/automukit_api && ./start.sh 

#!/bin/bash
lock="/var/lock/automukit_api.lock"
(
flock -x -w 5 200 || exit 1
echo "$lock acquired."
npm install
npm run build
npm start
) 200>$lock >> /var/log/automukit_api.log 2>&1

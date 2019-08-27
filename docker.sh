#!/bin/sh
while ! curl -s $CIRRUS_ENDPOINT > /dev/null
do
  echo "$(date) - waiting for cirrus endpoint at $CIRRUS_ENDPOINT"
  sleep 1
done
echo "$(date) - connected to cirrus"

node index.js

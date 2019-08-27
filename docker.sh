#!/bin/sh
while ! curl $CIRRUS_ENDPOINT
do
  echo "$(date) - still trying"
  sleep 1
done
echo "$(date) - connected successfully"

node index.js

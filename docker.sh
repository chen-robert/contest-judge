#!/bin/bash

if [ ${CIRRUS_ENDPOINT+x} ]; then
  while ! curl -s $CIRRUS_ENDPOINT > /dev/null
  do
    echo "$(date) - waiting for cirrus endpoint at $CIRRUS_ENDPOINT"
    sleep 1
  done
  echo "$(date) - connected to cirrus"
else
  echo "\$CIRRUS_ENDPOINT not defined, skipping checks"
fi

node index.js

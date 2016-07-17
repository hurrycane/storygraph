#!/bin/bash -x

curl -XPOST -H 'content-type:application/json' localhost:3033/syntaxnet -d '{
  "input": "There once was a speedy Hare who bragged about how fast he could run." 
}'

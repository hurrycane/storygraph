#!/bin/bash -x

curl -XPOST -H 'content-type:application/json' localhost:3000/syntaxnet -d '{
  "input": "Bob brought the pizza to Alice."
}'

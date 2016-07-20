#!/bin/sh
# `/sbin/setuser memcache` runs the given command as the user `memcache`.
# If you omit that part, the command will be run as root.

cd /data/storygraph-api
python -m flask run -h 0.0.0.0 >> /var/log/storygraph-api.log 2>&1

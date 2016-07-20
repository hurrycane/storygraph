#!/bin/sh
# `/sbin/setuser memcache` runs the given command as the user `memcache`.
# If you omit that part, the command will be run as root.

cd /data/frontend
/usr/bin/python3 -m http.server >> /var/log/frontend.log 2>&1

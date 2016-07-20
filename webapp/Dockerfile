# Use phusion/baseimage as base image. To make your builds reproducible, make
# sure you lock down to a specific version, not to `latest`!
# See https://github.com/phusion/baseimage-docker/blob/master/Changelog.md for
# a list of version numbers.
FROM phusion/baseimage:0.9.19

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

RUN mkdir -p /data/frontend
ADD frontend /data/frontend

RUN mkdir /etc/service/storygraph-webapp
ADD frontend.sh /etc/service/storygraph-webapp/run

EXPOSE 8000

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

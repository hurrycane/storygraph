# Use phusion/baseimage as base image. To make your builds reproducible, make
# sure you lock down to a specific version, not to `latest`!
# See https://github.com/phusion/baseimage-docker/blob/master/Changelog.md for
# a list of version numbers.
FROM phusion/baseimage:0.9.19

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

RUN apt-get update
RUN apt-get install -y python-pip

RUN mkdir -p /data/storygraph-api
ADD api /data/storygraph-api

RUN pip install -r /data/storygraph-api/requirements.txt

RUN mkdir /etc/service/storygraph-api
ADD api.sh /etc/service/storygraph-api/run

ENV FLASK_APP /data/storygraph-api/app.py

EXPOSE 5000

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

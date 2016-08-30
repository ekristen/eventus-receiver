FROM mhart/alpine-node:4

WORKDIR /opt
EXPOSE 4000
CMD ["node", "receiver/server.js"]
VOLUME ["/data"]

ENV eventusreceiver_db__path=/data

COPY package.json /opt/package.json
RUN apk add --no-cache make gcc g++ python && npm install --production && apk del make gcc g++ python

COPY . /opt

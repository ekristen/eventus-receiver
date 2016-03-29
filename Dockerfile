FROM node:4

WORKDIR /opt
EXPOSE 4000
CMD ["node" "receiver/server.js"]
VOLUME ["/data"]

ENV eventusreceiver_db__path=/data

COPY package.json /opt/package.json
RUN npm install --production

COPY . /opt

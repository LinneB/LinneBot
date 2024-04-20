# TODO: Use LTS image for NodeJS 21 (when it comes out)
FROM node:21-alpine
WORKDIR /usr/src/app
COPY ["package*.json", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]

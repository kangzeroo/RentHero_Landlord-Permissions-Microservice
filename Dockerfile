FROM nodesource/trusty:6.3.1

ADD package.json package.json
RUN npm install
ADD . .

CMD ["npm","run", "dev"]

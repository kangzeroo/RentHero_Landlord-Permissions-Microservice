const express = require('express')
const https = require('https')
const fs = require('fs')
const morgan = require('morgan')
const router = require('./router')
const cors = require('cors')

const app = express()

// Database setup

// App setup
// morgan and bodyParser are middlewares. any incoming requests will be passed through each
// morgan is a logging framework to see incoming requests. used mostly for debugging
app.use(morgan('tiny'));
// CORS middleware (cross origin resource sharing) to configure what domain & ips can talk to our server api
// CORS is used for user security on web browsers. Enable CORS on server to allow all I.P. addresses
app.use(cors());

// we instantiate the router function that defines all our HTTP route endpoints
router(app);

// instantiate the SSL certificate necessary for HTTPS
const options = {
    key: fs.readFileSync('./credentials/server.key'),
    cert: fs.readFileSync('./credentials/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
}

// Server setup
// if there is an environment variable of PORT already defined, use it. otherwise use port 3091
const port = process.env.PORT || 3000

// create a server with the native node https library
const server = https.createServer(options, app)

// listen to the server on port
server.listen(port, function(){
  console.log("Getting ready to go...")
  console.log("Server listening on: ", port)
})

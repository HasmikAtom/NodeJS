'use strict'

const http = require('http');
const fs = require('fs');

const Utils = require('./utils');
const Handlers = require('./handlers')
const APIEndPoint = '/api/tweets';

const server = http.createServer((req, res) => {
  Handlers.handleEndPoints(req,res)
})

server.listen(3000, console.log('listening'))

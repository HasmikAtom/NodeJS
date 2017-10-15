'use strict'

const http = require('http');

const Handlers = require('./handlers')
const Utils = require('./utils')


const server = http.createServer((req, res) => {
  return Handlers.handleEndPoints(req,res)
  .catch((err) =>{
    console.log('Error Occured', err)
    Utils.resBadRequest(res,err)
  })
})

server.listen(3000, console.log('listening'))

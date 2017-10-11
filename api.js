'use strict'

const http = require('http');
const fs = require('fs');

const Utils = require('./utils');

const APIEndPoint = '/api/tweets';
// move endpoint check into handlers.js and maybe change into switch
const server = http.createServer((req, res) => {
  const {method, url, headers } = req

  if(url === APIEndPoint && method === 'POST'){ // change to switch
    Utils.sendTweetsAPI(req,res)
  }else if(url === APIEndPoint && method === 'GET'){
    Utils.getAllTweetsAPI(req, res)
  }else if(url.startsWith(APIEndPoint) && method === 'GET'){
    Utils.getSingleTweetAPI(req, res)
  }else if(url.startsWith(APIEndPoint) && method === 'PUT'){
    Utils.updateTweetAPI(req,res) // forgot the action
  }else if(url.startsWith(APIEndPoint) && method === 'DELETE'){
    Utils.deleteTweetAPI(req,res) //WORKS
  }else if(url === '/' && method === 'GET'){
    Utils.getAllTweets(req,res)
  }else if(method === 'GET'){
    Utils.getSingleTweet(req,res)
  }else{
    res.statusCode = 400
    res.end('Bad Request')
  }
})

server.listen(3000, console.log('listening'))

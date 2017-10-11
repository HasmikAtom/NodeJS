const fs = require ('fs');

const DB = require('./database')
const Utils = require('./utils')

const APIEndPoint = '/api/tweets';

const Handlers = {};
module.exports = Handlers;

Handlers.handleEndPoints = (req,res) =>{
    Utils.getAPITweetID(req.url)

    const {method, url, headers } = req

    if(url === APIEndPoint && method === 'POST'){ // change to switch
      DB.sendTweetsAPI(req,res)
    }else if(url === APIEndPoint && method === 'GET'){
      DB.getAllTweetsAPI(req, res)
    }else if(url.startsWith(APIEndPoint) && method === 'GET'){
      DB.getSingleTweetAPI(req, res)
    }else if(url.startsWith(APIEndPoint) && method === 'PUT'){
      DB.updateTweetAPI(req,res) // forgot the action
    }else if(url.startsWith(APIEndPoint) && method === 'DELETE'){
      DB.deleteTweetAPI(req,res) //WORKS
    }else if(url === '/' && method === 'GET'){
      DB.getAllTweets(req,res)
    }else if(method === 'GET'){
      DB.getSingleTweet(req,res)
    }else{
      res.statusCode = 400
      res.end('Bad Request')
    }
}

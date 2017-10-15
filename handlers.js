const fs = require ('fs');

const DB = require('./database')
const Utils = require('./utils')

const APIEndPoint = '/api/tweets';

const Handlers = {};
module.exports = Handlers;

Handlers.handleEndPoints = (req,res) =>{
    const id = Utils.getAPITweetID(req.url)

    const {method, url, headers } = req

    if(url === APIEndPoint && method === 'POST'){ // change to switch
      return DB.sendTweetsAPI(req)
      .then(() => {
        return Utils.resSendTweetsAPI(res)
      })
    }else if(url === APIEndPoint && method === 'GET'){
      return DB.getAllTweetsAPI(req)
      .then((data)=> {
        return Utils.resGetAllTweets(res,data)
      })
    }else if(url.startsWith(APIEndPoint) && method === 'GET'){
      return DB.getSingleTweetAPI(req)
      .then((tweet) =>{
        if(tweet){
          return Utils.resGetSingleTweet(res,tweet)
        }else{
          return Utils.resTweetNotFound(res,id)
        }
      })
    }else if(url.startsWith(APIEndPoint) && method === 'PUT'){
      return DB.updateTweetAPI(req)
      .then((tweetExists) => {
        tweetExists ? Utils.resUpdateTweetAPI(res, id) : Utils.resTweetNotFound(res,id)
      })
    }else if(url.startsWith(APIEndPoint) && method === 'DELETE'){
      return DB.deleteTweetAPI(req)
      .then((tweetExists) =>{
        tweetExists ? Utils.resDeleteTweetAPI(res,id) : Utils.resTweetNotFound(res,id)
      })
    }else if(url === '/' && method === 'GET'){
      return DB.getAllTweets(req)
      .then((html) =>{
        return Utils.resWebGetAllTweets(res,html)
      })
    }else if(method === 'GET'){
      return DB.getSingleTweet(req)
      .then((html) =>{
        return Utils.resWebGetSingleTweet(res,html)
      })
    }else{
      res.statusCode = 400
      res.end('Bad Request')
    }
}

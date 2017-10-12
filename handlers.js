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
      return DB.sendTweetsAPI(req,res)
      .then(() => {
        Utils.resSendTweetsAPI(res)
      })
      .catch((err) =>{
        Utils.resBadRequest(res,err)
      })
    }else if(url === APIEndPoint && method === 'GET'){
      return DB.getAllTweetsAPI(req, res)
      .then((data)=> {
        Utils.resGetAllTweets(res,data)
      })
      .catch((err)=>{
        Utils.resBadRequest(res,err)
      })
    }else if(url.startsWith(APIEndPoint) && method === 'GET'){
      return DB.getSingleTweetAPI(req, res)
      .then((tweet) =>{
        if(tweet){
          Utils.resGetSingleTweet(res,tweet)
        }else{
          Utils.resTweetNotFound(res,id)
        }
      })
      .catch((err) =>{
        Utils.resBadRequest(res,err)
      })
    }else if(url.startsWith(APIEndPoint) && method === 'PUT'){
      return DB.updateTweetAPI(req,res)
      .then((tweetExists) => {
        // console.log(tweetExists)
        tweetExists ? Utils.resUpdateTweetAPI(res, id) : Utils.resTweetNotFound(res,id)
      })
      .catch((err) => {
        Utils.resBadRequest(res,err)
      })
    }else if(url.startsWith(APIEndPoint) && method === 'DELETE'){
      return DB.deleteTweetAPI(req,res)
      .then((tweetExists) =>{
        console.log({tweetExists})
        tweetExists ? Utils.resDeleteTweetAPI(res,id) : Utils.resTweetNotFound(res,id)
      })
      .catch((err) =>{
        Utils.resBadRequest(res,err)
      })
    }else if(url === '/' && method === 'GET'){
      DB.getAllTweets(req,res)
    }else if(method === 'GET'){
      DB.getSingleTweet(req,res)
    }else{
      res.statusCode = 400
      res.end('Bad Request')
    }
}

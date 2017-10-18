const fs = require ('fs');
const Handlebars = require('handlebars')

const DB = require('./database')
const Utils = require('./utils')

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
const Tweets = './public/tweets.hbs'
const singleTweet = './public/tweet.hbs'

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
      return DB.fileRead(tweetPath)
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
    }else if(url === '/' && method === 'GET'){ // into template.js
      return DB.fileRead(tweetPath)
      .then((data) => {
        fs.readFile(Tweets, 'utf-8', function(err,source) {
          if(err) throw err
          let template = Handlebars.compile(source)
          let html = template({tweets: JSON.parse(data).tweets})
          res.end(html)
        })
      })
    }else if(method === 'GET'){ // into template.js
      const id = req.url.split('/')[1]
      let foundTweet = ''
      return DB.fileRead(tweetPath)
      .then((data)=>{
        if(data) {
          JSON.parse(data).tweets.forEach((tweet) =>{
            if(tweet.id == id)
            foundTweet = tweet
          })
        }
      })
      .then(() =>{
        fs.readFile(singleTweet, 'utf-8', function(err,source){
          if(err) throw err
          var template = Handlebars.compile(source)
          var html = template({tweets: foundTweet})
          // console.log(foundTweet)
          res.end(html)
        })
      })
    }else if(url.split('?')[0] === '/create'){
      console.log(new Date())
      return Utils.readBody(req)

      // .then((body) =>{
      //   // console.log(body)
      //   return Utils.processBody(body)
      //   .then((obj) => {
      //     return DB.sendTweetsAPI(obj)
        // })
        // .then(()=>{
        //   return Utils.resRedirectHome(res)
        // })
      // })
    }
    else{
      res.statusCode = 400
      res.end('Bad Request')
    }
}

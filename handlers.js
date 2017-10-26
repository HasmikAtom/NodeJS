const fs = require ('fs');
const Handlebars = require('handlebars')

const DB = require('./database')
const Utils = require('./utils')
const Template = require('./template')

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
const templateAll = './public/tweets.hbs'
const templateSingle = './public/tweet.hbs'

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
        Template.allTweets(res, data)
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
        fs.readFile(templateSingle, 'utf-8', function(err,source){
          if(err) throw err
          var template = Handlebars.compile(source)
          var html = template({tweets: foundTweet})
          // console.log(foundTweet)
          res.end(html)
        })
      })
    }else if(url.split('?')[0] === '/create'){
      return Utils.readBody(req)
      .then((body) =>{
        return Utils.processBody(body)
        .then((obj) => {
          return DB.sendTweets(req, obj) // change this
        })
        .then(()=>{
          return Utils.resRedirectHome(res)
        })
      })
    }else if (url.startsWith('/delete/') && method === 'POST') {
      const id = url.split('/')[2]
      console.log('here')
      return DB.deleteTweetAPI(req, id)
      .then((found) => {
        res.writeHead(302, {Location: '/'})
        res.end()
      })
    }else if (url.startsWith('/update/') && method === 'POST') {
      const id = url.split('/')[2]
      let update
      return Utils.readBody(req)
      .then((body) =>{
        update = body.split('=')[1]
        update = decodeURIComponent(update.replace(/\+/g, ' '))
        return update
      })
      .then(() => DB.fileRead(tweetPath))
      .then((data) => {
        let tweetExists = false
        if(data){
          let fileTweets = JSON.parse(data)
          fileTweets.tweets = fileTweets.tweets.filter(tweet => {
            if(tweet.id != id){
              return true
            }
            tweetExists = true
            tweet.tweet = update
            return true
          })
          if(tweetExists){
            return DB.fileWrite(tweetPath, fileTweets)
          }
          return Promise.resolve(tweetExists)
        }
      })
      .then(() => {
        res.writeHead(302, {Location: '/'})
        res.end();
      })
    }
    else{
      res.statusCode = 400
      res.end('Bad Request')
    }
}

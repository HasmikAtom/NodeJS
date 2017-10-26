const fs = require ('fs');
const Handlebars = require('handlebars')

const Database = require('./database')
const Utils = require('./utils')
const Template = require('./template')

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
const templateAll = './public/tweets.hbs'
const templateSingle = './public/tweet.hbs'

Database.tableCheck() // important

const Handlers = {};
module.exports = Handlers;

Handlers.handleEndPoints = (req,res) =>{
    // const id = Utils.getAPITweetID(req.url)
    const {method, url, headers } = req

    const apiID = req.url.split('/')[3]
    const webID = req.url.split('/')[2]

    if (url === '/favicon.ico') {
      res.end()
      return Promise.resolve()
    }else if (url === '/api/tweets' && method === 'POST') {
      return Utils.readBody(req)
      .then((body) => {
        let tweets = JSON.parse(body)
        return tweets
      })
      .then(Database.addTweets)
      .then(Utils.resSendTweetsAPI(res))
    }else if (url === 'api/tweets' && method === 'GET') {
      return Database.fileRead()
      .then((data) => Utils.resGetAllTweets(res, JSON.stringify(data))) // json stringify?
    }else if (url.startsWith('/api/tweets')) {
      switch (method) {
        case 'GET':
          return Database.getTweet(apiID)
          .then((tweet) =>{
            tweet ? Utils.resGetSingleTweet(res, tweet) : Utils.resTweetNotFound(res, apiID)
          })
          break;
        case 'DELETE':
          return Database.deleteTweet(apiID)
          .then((tweet) => {
            tweet ? Utils.resDeleteTweetAPI(res, apiID) : Utils.resTweetNotFound(res, apiID)
          })
          break;
        case 'PUT':
        return Utils.readBody(req)
        .then((body) => {
          let tweet = JSON.parse(body)
          console.log(tweet[0].tweet)
          return tweet[0].tweet
        })
        .then((newTweet) => Database.updateTweet(apiID, newTweet))
        .then((found) => {
          found ? Utils.resUpdateTweetAPI(res, apiID) : Utils.resTweetNotFound(res, apiID)
        })
        break;
      }
    }else if (url === '/' && method === 'GET') {
      return Database.fileRead()
      .then((data) => {
        Template.allTweets(res, data) // check
      })
    }else if (url.startsWith('/create') && method === 'GET') {
      let tweetExists = ''
      return Database.getTweet(webID)
      .then((tweet) => {
        if (tweet) tweetExists = tweet
        return tweetExists
      })
      .then(() => {
        if (tweetExists){
          fs.readFile(templateSingle, 'utf-8', function(err, source) {
            if (err) throw err
            const template = Handlebars.compile(source);
            const html = template({tweets: tweetExists})
            Utils.resWebGetSingleTweet(res, html)
          })
        } else {
          Utils.resTweetNotFound(res, webID)
        }
      })
    }else if (url === '/create' && method === 'POST') {
      return Utils.readBody(req)
      .then(Utils.dataToTweet) // data to tweets
      .then((tweet) => Database.addTweets(tweet))
      .then(() => Utils.resRedirectHome(res))
    }else if (url.startsWith('/delete/') && method === 'POST') {
      return Database.deleteTweet(webID)
      .then(()=> Utils.resRedirectHome(res))
    }else if (url.startsWith('/update/') && method === 'POST') {
      let newTweet
      return Utils.readBody(req)
      .then((body) => {
        newTweet = body.split('=')[1]
        newTweet = decodeURIComponent(newTweet.replace(/\+/g, ' '))
        return newTweet
      })
      .then(() => Database.updateTweet(webID, newTweet))
      .then(() => Utils.resRedirectHome(res))
    }else{
      res.statusCode = 400
      res.end('Bad Request')
    }

    // if(url === APIEndPoint && method === 'POST'){ // change to switch
    //   return Database.sendTweetsAPI(req)
    //   .then(() => {
    //     return Utils.resSendTweetsAPI(res)
    //   })
    // }else if(url === APIEndPoint && method === 'GET'){
    //   return Database.fileRead(tweetPath)
    //   .then((data)=> {
    //     return Utils.resGetAllTweets(res,data)
    //   })
    // }else if(url.startsWith(APIEndPoint) && method === 'GET'){
    //   return Database.getSingleTweetAPI(req)
    //   .then((tweet) =>{
    //     if(tweet){
    //       return Utils.resGetSingleTweet(res,tweet)
    //     }else{
    //       return Utils.resTweetNotFound(res,id)
    //     }
    //   })
    // }else if(url.startsWith(APIEndPoint) && method === 'PUT'){
    //   return Database.updateTweetAPI(req)
    //   .then((tweetExists) => {
    //     tweetExists ? Utils.resUpdateTweetAPI(res, id) : Utils.resTweetNotFound(res,id)
    //   })
    // }else if(url.startsWith(APIEndPoint) && method === 'DELETE'){
    //   return Database.deleteTweetAPI(req)
    //   .then((tweetExists) =>{
    //     tweetExists ? Utils.resDeleteTweetAPI(res,id) : Utils.resTweetNotFound(res,id)
    //   })
    // }else if(url === '/' && method === 'GET'){ // into template.js
    //   return Database.fileRead(tweetPath)
    //   .then((data) => {
    //     Template.allTweets(res, data)
    //   })
    // }else if(method === 'GET'){ // into template.js
    //   const id = req.url.split('/')[1]
    //   let foundTweet = ''
    //   return Database.fileRead(tweetPath)
    //   .then((data)=>{
    //     if(data) {
    //       JSON.parse(data).tweets.forEach((tweet) =>{
    //         if(tweet.id == id)
    //         foundTweet = tweet
    //       })
    //     }
    //   })
    //   .then(() =>{
    //     fs.readFile(templateSingle, 'utf-8', function(err,source){
    //       if(err) throw err
    //       var template = Handlebars.compile(source)
    //       var html = template({tweets: foundTweet})
    //       // console.log(foundTweet)
    //       res.end(html)
    //     })
    //   })
    // }else if(url.split('?')[0] === '/create'){
    //   return Utils.readBody(req)
    //   .then((body) =>{
    //     return Utils.processBody(body)
    //     .then((obj) => {
    //       return Database.addTweets(req, obj) // change this
    //     })
    //     .then(()=>{
    //       return Utils.resRedirectHome(res)
    //     })
    //   })
    // }else if (url.startsWith('/delete/') && method === 'POST') {
    //   const id = url.split('/')[2]
    //   console.log('here')
    //   return Database.deleteTweetAPI(req, id)
    //   .then((found) => {
    //     res.writeHead(302, {Location: '/'})
    //     res.end()
    //   })
    // }else if (url.startsWith('/update/') && method === 'POST') {
    //   const id = url.split('/')[2]
    //   let update
    //   return Utils.readBody(req)
    //   .then((body) =>{
    //     update = body.split('=')[1]
    //     update = decodeURIComponent(update.replace(/\+/g, ' '))
    //     return update
    //   })
    //   .then(() => Database.fileRead(tweetPath))
    //   .then((data) => {
    //     let tweetExists = false
    //     if(data){
    //       let fileTweets = JSON.parse(data)
    //       fileTweets.tweets = fileTweets.tweets.filter(tweet => {
    //         if(tweet.id != id){
    //           return true
    //         }
    //         tweetExists = true
    //         tweet.tweet = update
    //         return true
    //       })
    //       if(tweetExists){
    //         return Database.fileWrite(tweetPath, fileTweets)
    //       }
    //       return Promise.resolve(tweetExists)
    //     }
    //   })
    //   .then(() => {
    //     res.writeHead(302, {Location: '/'})
    //     res.end();
    //   })
    // }
    // else{
    //   res.statusCode = 400
    //   res.end('Bad Request')
    // }
}

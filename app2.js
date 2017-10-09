'use strict'

const http = require('http');
const fs = require('fs');
const handlebars = require('handlebars');

//functions
const readBody = (req, callback) =>{
  let bodyArray = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk)=>{
    bodyArray.push(chunk);
  }).on('end', () =>{
    bodyArray = Buffer.concat(bodyArray).toString(); //buffer into string
    bodyArray = JSON.parse(bodyArray) //object looking string into json
    callback(bodyArray)
  })
}
const fileRead = (path, callback) =>{
  fs.readFile(path, 'utf8', (err, data) =>{
    if(err) throw err
    callback(data)
    })
}
const fileWrite = (path, data) => {
  fs.writeFile(path, JSON.stringify(data, null, '\t'), (err)=>{
    if(err) throw err
  })
}
const getQueryId = (url) => { //CONTINUE
  let id = url.split('/')[3]
  if(!id) return null
  return id
}
//Server start

const server = http.createServer((req, res) => {
  const {method, url, headers } = req
  let defEndPoint = '/api/tweets';
  let tweetPath = './tweets.json'

  // if(url !== defEndPoint) res.end('to got tweets')

  if (url === defEndPoint){
    if(method === 'POST'){
      readBody(req, (bodyArray)=>{
        let id = `${new Date().valueOf()}`
        bodyArray = bodyArray.map(tweet =>{
          id -= 10
          tweet = Object.assign({},tweet,{id})
          return tweet
        })
        fileRead(tweetPath, (data)=>{
          let obj = {}
          if(!data){
            console.log('data doesnt exists')
            obj = {'tweets':[]}
          }else{
            obj = JSON.parse(data)
            console.log('data exists')
          }
          const oldTweets = obj.tweets
          const newTweets = oldTweets.concat(bodyArray)
          let newObj = {'tweets': newTweets}
          fileWrite(tweetPath, newObj)
      })
    }) //readbody end
  } else if(method === 'GET'){ // method check end
      fileRead(tweetPath, (data) =>{ // data on callback
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(data)
      })
    }
    //getting tweets by id
  }else if(method === 'GET' && url.startsWith(defEndPoint)){
    getQueryId(url)
    // console.log("URL ID",getQueryId(url))
    fileRead(tweetPath,(data) =>{
      // console.log(data)
      if(data){
        let fileTweets = JSON.parse(data.toString())
        //console.log("filetweets",fileTweets)
        //console.log('tweets object in filetweets', fileTweets.tweets)
        fileTweets.tweets.map(tweet=>{
          //console.log('tweet id',tweet.id)
          if(tweet.id == getQueryId(url)){
            //console.log("map tweet",JSON.stringify(tweet))
            res.end(JSON.stringify(tweet))
          }else res.end('tweets not found') // change messaging system
        })
      }//if(data) end
    })
  }else if(method ==='DELETE' && url.startsWith(defEndPoint)){
    getQueryId(url)
    fileRead(tweetPath,(data)=>{
      //console.log(data)
      let tweetExists = false
      let deleteTweet
      let presentTweets = [] // deletes all tweets without this
      if(data){
        let fileTweets = JSON.parse(data.toString())
        fileTweets.tweets.map(tweet=>{
          if(tweet.id != getQueryId(url)){
            console.log('tweet not found')
            presentTweets.push(tweet)
            // console.log('newdata push tweet', tweet)
            //console.log('found tweet', tweet)
          }else {
            tweetExists = true
            console.log('found tweet',tweet)
            deleteTweet = tweet
            console.log('delete tweet',deleteTweet)
            // console.log('delete tweet',deleteTweet)
            console.log('deleted')
          }
        })
      if(tweetExists){
        fileTweets.tweets = presentTweets
        fileWrite(tweetPath, fileTweets)
      }
      }
    })
  }
})

server.listen(3000, console.log('listening'))

'use strict'

const http = require('http');
const fs = require('fs');
const handlebars = require('handlebars');

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
// install wakatime
//functions
const readBody = (req, callback) =>{ // append id when reading the body
  let bodyArray = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk)=>{
    bodyArray.push(chunk);
  }).on('end', () =>{
    bodyArray = Buffer.concat(bodyArray).toString();
    bodyArray = JSON.parse(bodyArray)
    let id = `${new Date().valueOf()}`
    bodyArray = bodyArray.map(tweet =>{
      id -= 10
      tweet = Object.assign({},tweet,{id})
      return tweet // MUST RETURN!!!
    })
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
const getAPITweetID = (url) => { //CONTINUE
  let id = url.split('/')[3]
  if(!id) return null
  return id
}
//dont forget writeHeads
//turn functions into promises
//write post and delete in one function, separate methods
// write get api tweets, single or all in on function
//
const sendTweets = (req, res) =>{ // WORKS!!!
  // tweet id appends while reading the body
  readBody(req, (bodyArray)=>{
    fileRead(tweetPath, (data)=>{
      let obj = {}
      if(!data){ //data doesnt exist, create new obj with 'tweets' key
        obj = {'tweets' : []}
      }else { // data exists, assign data to the empty object
        obj = JSON.parse(data)
      }
      const oldTweets = obj.tweets
      const newTweets = oldTweets.concat(bodyArray)
      let newObj = {'tweets': newTweets}
      fileWrite(tweetPath, newObj)
      res.statusCode = 200
      res.end(`recieved:\n${JSON.stringify(bodyArray, null, '\t')}`)
    })
  })
}
const updateTweetAPI = (req, res, action) => { // PUT doesnt work!
  readBody(req, (bodyData) =>{
    const id = getAPITweetID(req.url)
    fileRead(tweetPath,(data)=>{
      let tweetExists = false
      let unreqTweets = [] // empty array to store the undeleted tweets in
        if(data){
        let fileTweets = JSON.parse(data.toString())
        fileTweets.tweets.forEach((tweet)=>{
          if(tweet.id != id){
            unreqTweets.push(tweet)
          }else {
            tweetExists = true
            if(action === 'UPDATE'){
              let updTweet = bodyData[0] // error here
              updTweet.id = tweet.id // using same id for the updated tweet
              unreqTweets.push(updTweet)
            }
          }
        })
        if(tweetExists){
          fileTweets.tweets = unreqTweets // be attentive
          fileWrite(tweetPath, fileTweets)
          res.writeHead(200,{'Content-Type': 'application/json'})
          res.end(`{"message": "Successfully ${action === 'DELETE' ? 'deleted' : 'updated'} tweet ${id}"}`)
        }
      }
    })
  })
}
const getTweetsAPI = (req, res, action) =>{ // both single and all tweets
  fileRead(tweetPath,(data)=>{
    if(action === 'ALL TWEETS'){
      res.writeHead(200, {'Content-Type':'application/json'})
      res.end(JSON.stringify(data.toString())) // to string?
    }else if (action === 'SINGLE TWEET') {
      const id = getAPITweetID(req.url)
      let tweetExists = false
      if(data){
        let fileTweets = JSON.parse(data.toString())
        fileTweets.tweets.forEach((tweet)=>{
          if(tweet.id == id){
            tweetExists = true
            res.end(JSON.stringify(tweet, null, '\t'))
          }
        })
        if(!tweetExists){
          res.statusCode = 404 // send not found status code
          res.end(`tweet with id ${id} not found!`)
        }
      }
    }
  })
}
const getAllTweets = (req, res) =>{
  let tweetsExist = false
  let template = '<html><body><ul>'
  fileRead(tweetPath, (data)=>{
    if(data){
      tweetsExist = true
      JSON.parse(data).tweets.map(tweet =>{
        template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
      })
    }
    if(!tweetsExist) res.end('no tweets to show')
    template += '</ul></body></html>'
    res.end(template)
  })
}
const getSingleTweet =(req, res)=>{
  const id = getAPITweetID(req.url)
  let tweetExists = false
  let template = '<html><body><ul>'
  fileRead(tweetPath, (data)=>{
    if(data){
      let fileTweets = JSON.parse(data.toString())
      fileTweets.tweets.map(tweet =>{
        if(tweet.id == id ){
        tweetExists = true
        template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
        }
      })
    }
    if(!tweetExists) res.end(`tweet with the id ${tweetId} not found!`)
    template += '</ul></body></html>'
    res.end(template)
  })
}
//Server start
const server = http.createServer((req, res) => {
  const {method, url, headers } = req

  if(url === APIEndPoint && method === 'POST'){ // change to switch
      sendTweets(req,res)
  }else if(url === APIEndPoint && method === 'GET'){
      getTweetsAPI(req, res, 'ALL TWEETS')
  }else if(url.startsWith(APIEndPoint) && method === 'GET'){
    getTweetsAPI(req, res, 'SINGLE TWEET')
  }else if(url.startsWith(APIEndPoint) && method === 'PUT'){
    updateTweetAPI(req,res,'UPDATE') // forgot the action
  }else if(url.startsWith(APIEndPoint) && method === 'DELETE'){
    updateTweetAPI(req,res,'DELETE') //WORKS
  }else if(url === '/' && method === 'GET'){
    getAllTweets(req,res)
  }else if(method === 'GET'){
    getSingleTweet(req,res)
  }else{
    res.statusCode = 400
    res.end('Bad Request')
  }
})

server.listen(3000, console.log('listening'))

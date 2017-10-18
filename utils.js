
const fs = require('fs')

const Utils = {}
module.exports = Utils

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
// move read write update delete into database.js
//dont forget writeHeads. almost...
//turn callbacks into promises, done
//maybe separate find and filter into functions

// create file find id function
Utils.getAPITweetID = (url) => { //to promise or not to promise
  let id = url.split('/')[3]
  if(!id) return null
  return id
}
Utils.readBody = (req) => {
  console.log(req.on)
  return new Promise ((resolve,reject) => {
    // console.log('here')
    let body =[]
    req.on('error', (err) => {
       console.error(err)
       return resolve(err)
    }).on('data', (chunk) =>{
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      //body = JSON.parse(body)
      return resolve(body)
    })
  })
}

// add responses that go into handlers
// responses contain writeHeads, and send a message or tweet on res.end

// send tweets, take res as an argument, send message that its recieved
// get single tweet ,res tweet , res end tweet
// get all tweets, res data, res end data
// delete, res id, res end message
// update, res id, res end message
//tweets not found, res id, res end message
//bad request, res err, res end err

Utils.resSendTweetsAPI = (res) =>{
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{'message': 'Data Recieved'}`)
}
Utils.resUpdateTweetAPI = (res,id) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{"message": "Tweet ${id} Updated"}`)
}
Utils.resDeleteTweetAPI = (res,id) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{"message": "Tweet ${id} Deleted"}`)
}
Utils.resGetSingleTweet = (res,tweet) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(JSON.stringify(tweet, null,'\t'))
}
Utils.resGetAllTweets = (res, data) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(data)
}
Utils.resBadRequest = (res, err) => {
  res.writeHead(400)
  res.end(err.message) // important
}
Utils.resTweetNotFound = (res,id) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{'message': 'Tweet ${id} not found'}`)
}
Utils.resWebGetAllTweets = (res,html) => {
  res.writeHead(200,{'Content-Type':'text/html'})
  res.end(html)
}
Utils.resWebGetSingleTweet = (res, html) => {
  res.writeHead(200,{'Content-Type':'text/html'})
  res.end(html)
}

Utils.processBody = (body) => {
  // console.log('here')
  const query = body.split('=')
  const user = query[1].split('&')[0]
  const tweet = query[2].split('&')[0]
  const string = tweet.split('+').join(' ')
  const obj = [{user:user, tweet:tweet}]
  // console.log(obj)
  return Promise.resolve(JSON.stringify(obj))
}

Utils.resRedirectHome = (res) => {
  res.writeHead(302, {Location: 'http://localhost:3000/'})
  res.end()
}

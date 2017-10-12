
const fs = require('fs')

const Utils = {}
module.exports = Utils

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
// move read write update delete into database.js
//dont forget writeHeads. almost...
//turn callbacks into promises, done
//maybe separate find and filter into functions

Utils.getAPITweetID = (url) => { //to promise or not to promise
  let id = url.split('/')[3]
  if(!id) return null
  return id
}
Utils.readBody = (req) => {
  return new Promise ((resolve,reject) => {
    let body =[]
    req.on('error', (err) => {
       console.error(err)
       return resolve(err)
    }).on('data', (chunk) =>{
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      body = JSON.parse(body)
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
  console.log({id})
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
  res.end(err)
}
Utils.resTweetNotFound = (res,id) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{'message': 'Tweet ${id} not found'}`)
}

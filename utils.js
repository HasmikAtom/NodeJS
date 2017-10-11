
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
  console.log('')
  return new Promise ((resolve,reject) => {
    let body =[]
    req.on('error', (err) => {
      console.log('here')
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

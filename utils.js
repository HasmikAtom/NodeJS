const fs = require('fs')

const Utils = {}
module.exports = Utils

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
    }).on('data', (chunk) =>{
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      body = JSON.parse(body)
      return resolve(body)
    })
  })
} // promisified
Utils.fileRead = (path) => { // promisified
  return new Promise ((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if(err) return reject(err)
      return resolve(data)
    })
  })
}
Utils.fileWrite = (path, data) => { // to promise or to not promise
  fs.writeFile(path, JSON.stringify(data, null, '\t'), (err)=>{
    if(err) throw err
  })
}
Utils.sendTweetsAPI = (req, res) =>{ // writeheads?
  let bodyArray
  return Utils.readBody(req)
  .then((body) =>{
    let id = `${new Date().valueOf()}`
    bodyArray = body.map(tweet =>{
        id -= 10
        tweet = Object.assign({},tweet,{id})
        return tweet // MUST RETURN!!!
    })
  })
  .then( () => Utils.fileRead(tweetPath))
  .then( (data) =>{
    let obj = {}
    if(!data){ // forgot the !
      obj = {'tweets': []}
    }else {
      obj = JSON.parse(data)
    }
    const oldTweets = obj.tweets
    const newTweets = oldTweets.concat(bodyArray)
    console.log('bodyArray', bodyArray)
    console.log('newTweets', newTweets )
    let newObj = {'tweets': newTweets}
    return newObj
    })
  .then((newObj) => {
    console.log('newObj', newObj)
    Utils.fileWrite(tweetPath, newObj)
    res.statusCode = 200
    res.end(`received data`)
  })
  .catch((err) => console.log('error occured ', err))
} 
Utils.updateTweetAPI = (req, res) =>{
  const id = Utils.getAPITweetID(req.url)
  let tempBody
  return Utils.readBody(req)
  .then((body) => tempBody = body)
  .then(() => Utils.fileRead(tweetPath))
  .then((data) => {
    let tweetExists = false
    if(data){
      let fileTweets = JSON.parse(data.toString()) // use filter!!!
      fileTweets.tweets = fileTweets.tweets.filter(tweet => {
        if(tweet.id === id){
          return true // why?
        }else{
          tweetExists = true
          tweet.tweet = tempBody[0].tweet
          tweet.user = tempBody[0].user
          return true
        }
      })
      if(tweetExists){
        Utils.fileWrite(tweetPath, fileTweets)
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(`{"message" : 'tweet ${id} updated'}`)
      }
    }
    res.end(`tweet ${id} not found!`)
  })
  .catch((err) => console.log('error occured', err))
} 
Utils.deleteTweetAPI = (req,res) => {
  const id = Utils.getAPITweetID(req.url)
  return Utils.fileRead(tweetPath)
  .then((data) => {
    let tweetExists = false
    if(data){
      let fileTweets = JSON.parse(data.toString())
      fileTweets.tweets = fileTweets.tweets.filter(tweet =>{ // change to filter!!!
        if(tweet.id !=id){
          return true
        }else {
          tweetExists = true
          return false// whyyyy
        }
      })
      if(tweetExists){
        Utils.fileWrite(tweetPath, fileTweets)
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(`tweet ${id} was deleted`)
      }
    }
    res.end(`tweet ${id} was not found`)
  })
  .catch((err) => console.log('error occured', err))
} 
Utils.getSingleTweetAPI = (req,res) => {
  return Utils.fileRead(tweetPath)
  .then((data)=>{
    const id = Utils.getAPITweetID(req.url)
    if(data){
      let fileTweets = JSON.parse(data.toString())
      fileTweets.tweets.find((tweet)=>{
        if(tweet.id == id){
          res.writeHead(200, {'Content-Type':'application/json'})
          res.end(JSON.stringify(tweet, null,'\t'))
        }
      })
      res.statusCode = 404
      res.end(`tweet with id ${id} not found`)
    }
  })
  .catch((err) => console.log('error occured', err))
} // promisified
Utils.getAllTweetsAPI = (req,res) =>{
  return Utils.fileRead(tweetPath)
  .then((data)=>{
    res.writeHead(200,{'Content-Type':'application/json'})
    res.end(data)
  })
} 
Utils.getAllTweets = (req,res) =>{
  let tweetsExist = false
  let template = '<html><body><ul>'
  return Utils.fileRead(tweetPath)
  .then((data)=>{
    if(data){
      tweetsExist = true
      JSON.parse(data).tweets.forEach((tweet) =>{ // use find?
        template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
      })
    }
    if(!tweetsExist) res.end('no tweets to show')
    template += '</ul></body></html>'
    res.end(template)
  })
  .catch((err)=> console.log(' error occured', err))
} 
Utils.getSingleTweet = (req,res) =>{
  const id = req.url.split('/')[1] // optimize?
  let tweetExists = false
  let template = '<html><body><ul>'
  return Utils.fileRead(tweetPath)
  .then((data) => {
    if(data){
      let fileTweets = JSON.parse(data.toString())
      fileTweets.tweets.find((tweet)=>{
        if(tweet.id == id){
          tweetExists = true
          template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
        }
      })
    }
    if(!tweetExists) res.end(`tweet with id ${id} not found!`)
    template += '</ul></body></html>'
    res.end(template)
  })
  .catch((err) => console.log('error occured', err))
} 

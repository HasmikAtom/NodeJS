const fs = require('fs')

const Utils = require('./utils.js')
console.log(Utils)
const tweetPath = './tweets.json'
const APIEndPoint = '/api/tweets';

const DB = {}
module.exports = DB

DB.fileRead = (path) => { // promisified
  return new Promise ((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if(err) return reject(err)
      return resolve(data)
    })
  })
}
DB.fileWrite = (path, data) => { // to promise or to not promise
  fs.writeFile(path, JSON.stringify(data, null, '\t'), (err)=>{
    if(err) throw err
  })
}

DB.sendTweetsAPI = (req, res) =>{ // writeheads?
  let bodyArray
  console.log('DB.sendTweetsAPI')
  return Utils.readBody(req)
  .then((body) =>{
    let id = `${new Date().valueOf()}`
    bodyArray = body.map(tweet =>{
        id -= 10
        tweet = Object.assign({},tweet,{id})
        return tweet // MUST RETURN!!!
    })
  })
  .then( () => DB.fileRead(tweetPath))
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
    DB.fileWrite(tweetPath, newObj)
    res.statusCode = 200
    res.end(`received data`)
  })
  // .catch((err) => console.log('error occured ', err))
} // promisified // promisified // promisified
DB.updateTweetAPI = (req, res) =>{
  const id = Utils.getAPITweetID(req.url)
  console.log({id})
  let tempBody
  return Utils.readBody(req)
  .then((body) => tempBody = body)
  .then(() => DB.fileRead(tweetPath))
  .then((data) => {
    console.log({data})
    let tweetExists = false
    if(data){
      let fileTweets = JSON.parse(data)
      console.log({fileTweets})
      console.log({tempBody})
      fileTweets.tweets = fileTweets.tweets.map((tweet) => {
        console.log(tweet)
        if(tweet.id == id){
          tweetExists = true
          tweet = Object.assign(tweet, tempBody[0])
          return tweet
        }
        return tweet
      })
      if(tweetExists){
        DB.fileWrite(tweetPath, fileTweets)
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(`{"message" : 'tweet ${id} updated'}`)
      }
    }
    res.end(`tweet ${id} not found!`)
  })
  // .catch((err) => console.log('error occured', err))
} // promisified
DB.deleteTweetAPI = (req,res) => {
  const id = Utils.getAPITweetID(req.url)
  return DB.fileRead(tweetPath)
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
        DB.fileWrite(tweetPath, fileTweets)
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(`tweet ${id} was deleted`)
      }
    }
    res.end(`tweet ${id} was not found`)
  })
  // .catch((err) => console.log('error occured', err))
}
DB.getSingleTweetAPI = (req,res) => {
  return DB.fileRead(tweetPath)
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
  // .catch((err) => console.log('error occured', err))
} // promisified
DB.getAllTweetsAPI = (req,res) =>{
  return DB.fileRead(tweetPath)
  .then((data)=>{
    res.writeHead(200,{'Content-Type':'application/json'})
    res.end(data)
  })
} // promisified
DB.getAllTweets = (req,res) =>{
  let tweetsExist = false
  let template = '<html><body><ul>'
  return DB.fileRead(tweetPath)
  .then((data)=>{
    if(data){
      tweetsExist = true
      JSON.parse(data).tweets.forEach((tweet) =>{
        template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
      })
    }
    if(!tweetsExist) res.end('no tweets to show')
    template += '</ul></body></html>'
    res.end(template)
  })
  // .catch((err)=> console.log(' error occured', err))
} // promisified
DB.getSingleTweet = (req,res) =>{
  const id = req.url.split('/')[1] // optimize?
  let tweetExists = false
  let template = '<html><body><ul>'
  return DB.fileRead(tweetPath)
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
  // .catch((err) => console.log('error occured', err))
} // promisified

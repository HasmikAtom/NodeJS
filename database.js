const fs = require('fs')

const Utils = require('./utils.js')

const tweetPath = './tweets.json'
const APIEndPoint = '/api/tweets';

const DB = {}
module.exports = DB

DB.fileRead = (path) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if(err) return reject(err)
      return resolve(data)
    })
  })
}
DB.fileWrite = (path, data) => {
  fs.writeFile(path, JSON.stringify(data, null, '\t'), (err)=>{
    if(err) throw err
  })
}
DB.sendTweetsAPI = (req) => {
  let newTweets
  return Utils.readBody(req)
  .then((body) => {
    let bodyJSON = JSON.parse(body)
    // let id = `${new Date().valueOf()}`
    // bodyJSON = bodyJSON.map(tweet => {
    //   id -= 10
    //   tweet = Object.assign({},tweet,{id})
    //   console.log('object assgn', tweet)
    //   return tweet
    // })
    newTweets = bodyJSON
    return newTweets
  })
  .then((newTweets) => DB.sendTweets(req, newTweets))
}
DB.sendTweets = (req, tweets) => {
  return DB.fileRead(tweetPath)
  .then((data) => {
    if(!data){
      let tweetsObj = {}
      tweetsObj.tweets = tweets
      return DB.fileWrite(tweetPath, tweetsObj) // return
    } else {
      let presentData = JSON.parse(data)
      presentData.tweets = presentData.tweets.concat(tweets)
      return DB.fileWrite(tweetPath, presentData) // return
    }
  })
}

DB.updateTweetAPI = (req) =>{
  const id = Utils.getAPITweetID(req.url)
  let tempBody
  return Utils.readBody(req)
  .then((body) => tempBody = body)
  .then(() => DB.fileRead(tweetPath))
  .then((data) => {
    let tweetExists = false
    let reqTweet = ''
    if(data){
      let fileTweets = JSON.parse(data)
      fileTweets.tweets.forEach((tweet) => {
        if(tweet.id == id){
          tweetExists = true
          tweet = Object.assign(tweet, tempBody[0])
          reqTweet = tweet
        }
      })
      if(tweetExists){
        DB.fileWrite(tweetPath, fileTweets)
      }
      return Promise.resolve(reqTweet)
    }
  })
}
DB.deleteTweetAPI = (req) => {
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
          return false
        }
      })
      if(tweetExists){
        DB.fileWrite(tweetPath, fileTweets)
      }
      return Promise.resolve(tweetExists)
    }
  })
}
DB.getSingleTweetAPI = (req) => {
  return DB.fileRead(tweetPath)
  .then((data)=>{
    let reqTweet = ''
    const id = Utils.getAPITweetID(req.url)
    if(data){
      let fileTweets = JSON.parse(data.toString())
      fileTweets.tweets.map((tweet)=>{
        if(tweet.id == id){
          reqTweet = tweet
        }
      })
      return Promise.resolve(reqTweet)
    }
  })
}

// DB.getAllTweets = (req) =>{
//   let tweetsExist = false
//   let template = '<html><body><ul>'
//   return DB.fileRead(tweetPath)
//   .then((data)=>{
//     if(data){
//       tweetsExist = true
//       JSON.parse(data).tweets.forEach((tweet) =>{
//         template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
//       })
//     }
//     if(!tweetsExist) res.end('no tweets to show')
//     template += '</ul></body></html>'
//     return template
//   })
// }
// DB.getSingleTweet = (req) =>{
//   const id = req.url.split('/')[1]
//   let tweetExists = false
//   let template = '<html><body><ul>'
//   return DB.fileRead(tweetPath)
//   .then((data) => {
//     if(data){
//       let fileTweets = JSON.parse(data.toString())
//       fileTweets.tweets.find((tweet)=>{
//         if(tweet.id == id){
//           tweetExists = true
//           template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
//         }
//       })
//     }
//     // if(!tweetExists) res.end(`tweet with id ${id} not found!`)
//     template += '</ul></body></html>'
//     return template
//   })
// }

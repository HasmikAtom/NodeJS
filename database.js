const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

const Utils = require('./utils.js')
const Cmd = require('./tweets.sql.js')

const tweetPath = './tweets.json'
const APIEndPoint = '/api/tweets';

const Database = {}
module.exports = Database

const db = new sqlite3.Database('tweets.db', err => {
  if(err) console.error(err)
  console.log('db connected')
})

Database.tableCheck= () => {
  db.all(Cmd.getTweetsTable, (err, rows) =>{
    if(err) {
      // console.log(err)
      db.run(Cmd.createTweetsTable)
    } else if (rows.length) {
      // console.log(rows)
    }
  })
}

Database.fileRead = () => { // remove path from parameters
  return new Promise ((resolve, reject) => {
    db.all(Cmd.getTweetsTable, (err, rows) =>{
      if (err) return reject(err)
      // console.log(rows)
      return resolve(rows)
    })
  })
}

Database.fileWrite = (path, data) => { // keep this
  fs.writeFile(path, JSON.stringify(data, null, '\t'), (err)=>{
    if(err) throw err
  })
}

Database.addTweets = (tweets) => {
  tweets.forEach((tweet) => {
    // console.log(tweet)
    db.run(Cmd.insertTweet(tweet.user, tweet.tweet), err =>{
      if (err) console.error(err)
    })
  })
  return 'added'
}
Database.updateTweet = (id, newTweet) => {
  return new Promise ((resolve, reject) =>{
    let found = resolve(Database.getTweet(id))
    db.run(Cmd.updateTweet(id, newTweet), err =>{
      if(err) console.error(err)
      return resolve(found ? true : false)
    })
  })
}

Database.deleteTweet = (id) => {
  return new Promise ((resolve, reject) => {
    let found = resolve(Database.getTweet(id))
    db.run(Cmd.deleteTweet(id), err =>{
      if(err) return reject(err)
      return resolve(found ? true : false)
    })
  })
}
Database.getTweet = (id) => {
  return new Promise ((resolve, reject) => {
    db.all(Cmd.getTweet(id), (err,row) =>{
      if(err) return reject(err)
      return resolve(row[0])
    })
  })
}

// Database.sendTweetsAPI = (req) => {
//   let newTweets
//   return Utils.readBody(req)
//   .then((body) => {
//     let bodyJSON = JSON.parse(body)
//     newTweets = bodyJSON
//     return newTweets
//   })
//   .then((newTweets) => Database.sendTweets(req, newTweets))
// }
// Database.sendTweets = (req, tweets) => {
//   return Database.fileRead(tweetPath)
//   .then((data) => {
//     if(!data){
//       let tweetsObj = {}
//       tweetsObj.tweets = tweets
//       return Database.fileWrite(tweetPath, tweetsObj) // return
//     } else {
//       let presentData = JSON.parse(data)
//       presentData.tweets = presentData.tweets.concat(tweets)
//       return Database.fileWrite(tweetPath, presentData) // return
//     }
//   })
// }
//
// Database.updateTweetAPI = (req) =>{
//   const id = Utils.getAPITweetID(req.url)
//   let tempBody
//   return Utils.readBody(req)
//   .then((body) => tempBody = body)
//   .then(() => Database.fileRead(tweetPath))
//   .then((data) => {
//     let tweetExists = false
//     let reqTweet = ''
//     if(data){
//       let fileTweets = JSON.parse(data)
//       fileTweets.tweets.forEach((tweet) => {
//         if(tweet.id == id){
//           tweetExists = true
//           tweet = Object.assign(tweet, tempBody[0])
//           reqTweet = tweet
//         }
//       })
//       if(tweetExists){
//         Database.fileWrite(tweetPath, fileTweets)
//       }
//       return Promise.resolve(reqTweet)
//     }
//   })
// }
// Database.deleteTweetAPI = (req, id) => {
//   return Database.fileRead(tweetPath)
//   .then((data) => {
//     let tweetExists = false
//     if(data){
//       let fileTweets = JSON.parse(data.toString())
//       fileTweets.tweets = fileTweets.tweets.filter(tweet =>{ // change to filter!!!
//         if(tweet.id !=id){
//           return true
//         }else {
//           tweetExists = true
//           return false
//         }
//       })
//       if(tweetExists){
//         Database.fileWrite(tweetPath, fileTweets)
//       }
//       return Promise.resolve(tweetExists)
//     }
//   })
// }
// Database.getSingleTweetAPI = (req) => {
//   return Database.fileRead(tweetPath)
//   .then((data)=>{
//     let reqTweet = ''
//     const id = Utils.getAPITweetID(req.url)
//     if(data){
//       let fileTweets = JSON.parse(data.toString())
//       fileTweets.tweets.map((tweet)=>{
//         if(tweet.id == id){
//           reqTweet = tweet
//         }
//       })
//       return Promise.resolve(reqTweet)
//     }
//   })
// }

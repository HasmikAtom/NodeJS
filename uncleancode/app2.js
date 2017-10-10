'use strict'

const http = require('http');
const fs = require('fs');
// do functions with export
const defEndPoint = '/api/tweets';
const tweetPath = './tweets.json'

//functions
const readBody = (req, callback) =>{
  let bodyArray = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk)=>{
    bodyArray.push(chunk);
  }).on('end', () =>{
    bodyArray = Buffer.concat(bodyArray).toString();
    bodyArray = JSON.parse(bodyArray)
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
          res.end(`recieved:\n${JSON.stringify(bodyArray, null, '\t')}`)
      })
    })
  }
    //deleting tweets by id, works
  }else if(method ==='DELETE' && url.startsWith(defEndPoint)){
    const tweetId = getQueryId(url)
    fileRead(tweetPath,(data)=>{
      let tweetExists = false
      let deleteTweet
      let presentTweets = [] // deletes all tweets without this
      if(data){
        let fileTweets = JSON.parse(data.toString())
        fileTweets.tweets.map(tweet=>{
          if(tweet.id != tweetId){ // didnt find
            presentTweets.push(tweet)// deletes all tweet without this
          }else {
            tweetExists = true // found
            deleteTweet = tweet
          }
        })
      if(tweetExists){
        fileTweets.tweets = presentTweets
        fileWrite(tweetPath, fileTweets)
        res.end(`{"message": "Successfully deleted tweet ${deleteTweet.id}"}`)
      }else res.end(`{"message": 'no tweet to delete'}`)
      }
    })
    //getting tweets by id
  }else if(method === 'GET'){
    if(url.startsWith(defEndPoint)){ // presenting single tweet
      const tweetId = getQueryId(url)
      let tweetExists = false
      let template = '<html><body><ul>'
      fileRead(tweetPath,(data) =>{
        if(data){
          let fileTweets = JSON.parse(data.toString())
          fileTweets.tweets.map(tweet=>{ // change map to forEach
            if(tweet.id == tweetId){
              tweetExists = true
              template += `<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
            } // api must return in a json format, fix it
          })
        }
        if(!tweetExists) res.end(`tweet with the id ${tweetId} not found!`)
        template += '</ul></body></html>'
        res.end(template)
      })
    }
    else if (url === '/'){ // presenting all tweets
      let tweetsExist = false
      let template = '<html><body><ul>'
      fileRead(tweetPath, (data)=>{
        if(data){
          tweetsExist = true
          JSON.parse(data).tweets.map(tweet=>{
            template +=`<li>"${tweet.tweet}"</li> <li>${tweet.user}</li> <li>${tweet.id}</li>`
          })
        }
        if(!tweetsExist) res.end(`tweet with the id ${tweetId} not found!`)
        template += '</ul></body></html>'
        res.end(template)
      })
    }

  }// GET check end
})

server.listen(3000, console.log('listening'))

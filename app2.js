'use strict'

const http = require('http');
const fs = require('fs');

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
  fs.writeFile(path, JSON.stringify(data), (err)=>{
    if(err) throw err
  })
}

//Server start

//
const server = http.createServer((req, res) => {
  const {method, url, headers } = req
  let defEndPoint = '/api/tweets';
  let tweetPath = './tweets.json'


  if(url !== defEndPoint) res.end('to got tweets')

  else if (url === defEndPoint){

    if(method === 'POST'){
      // let bodyArray = [];
      // req.on('error', (err) => {
      //   console.error(err);
      // }).on('data', (chunk)=>{
      //   bodyArray.push(chunk);
      // }).on('end', ()=>{
      //
      //   bodyArray = Buffer.concat(bodyArray).toString(); //buffer into string
      //   bodyArray = JSON.parse(bodyArray) //object looking string into json
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
            console.log('obj before posting to file', obj.tweets) //empty array
          }else{
            obj = JSON.parse(data.toString()) //
            console.log('data exists')
            // console.log('obj data', obj)
            // console.log('data without parse', data)
            // console.log('obj.tweets', obj.tweets)
          }
          const oldTweets = obj.tweets
          console.log('oldtweets', typeof oldTweets)
          const newTweets = oldTweets.concat(bodyArray)
          console.log('newTweets', newTweets)
          let newObj = {'tweets': newTweets}
          newObj = JSON.parse(JSON.stringify(newObj,null,'\t'))
          fileWrite(tweetPath, newObj)
        })
          // fs.readFile(tweetPath, 'utf8', (err,data) =>{ // read file
            // if(err) throw err;
            // let id = `${new Date().valueOf()}`
            // bodyArray = bodyArray.map(tweet =>{
            //   id -= 10
            //   tweet = Object.assign({},tweet,{id}) // creates object and adds tweets and id to it
            //   // tweet = {'id': id, 'tweet':tweet.tweet, 'user':tweet.user}
            //   return tweet
            // })
            // let obj = {}
            // if(!data){
            //   obj = {'tweets':[]}
            // }else{
            //   obj = JSON.parse(data)
            // }
            // const oldTweets = obj.tweets
            // console.log('oldtweets', oldTweets)
            // const newTweets = oldTweets.concat(bodyArray)
            // console.log('newTweets', newTweets)
            // let newObj = {'tweets': newTweets}
            // newObj = JSON.stringify(newObj, null, '\t')
            // fs.writeFile(tweetPath, newObj, (err)=> { // use append
            //   if(err) throw err;
            // })
          }) //readbody end
    //  })
  } else if(method === 'GET'){ // method check end
      fileRead(tweetPath, (data) =>{
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(data)
      })
      // fs.readFile(tweetPath, (err, data) =>{
      //   if(err) throw err;
      //   res.write(data.toString());
      //   res.end()
      // })
    }
  }

})

server.listen(3000, console.log('listening'))

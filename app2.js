'use strict'

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  let defEndPoint = '/tweets';
  let tweetPath = './tweets.json'
  let checkFile = fs.existsSync('./tweets.json')

// let bla = [{'astf':'dasg'}, {'asagah':'hrert'}]
// let ble = [{546: 'ywey'}, {6876: 'asafwtw'}]
//
// let blable = JSON.stringify(bla.concat(ble));
// console.log('concat array' + blable)

  const {method, url, headers } = req

  if(url !== defEndPoint) res.end('to got tweets')

  else if (url === defEndPoint){

    if(method === 'POST'){
      let bodyArray = [];
      req.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk)=>{
        // console.log(chunk)
        bodyArray.push(chunk);
      }).on('end', ()=>{

        bodyArray = Buffer.concat(bodyArray).toString(); //buffer into string
        bodyArray = JSON.parse(bodyArray) //object looking string into json

          fs.readFile(tweetPath, 'utf8', (err,data) =>{ // read file
            if(err) throw err;
            let id = `${new Date().valueOf()}`
            bodyArray = bodyArray.map(tweet =>{
              id -= 10
              tweet = Object.assign({},tweet,{id})
              // tweet = {'id': id, 'tweet':tweet.tweet, 'user':tweet.user}
              return tweet
            })
            let obj = {}
            if(!data){
              obj = {'tweets':[]}
            }else{
              obj = JSON.parse(data)
            }
            const oldTweets = obj.tweets
            const newTweets = oldTweets.concat(bodyArray)
            console.log(newTweets)
            let newObj = {'tweets': newTweets}
            newObj = JSON.stringify(newObj, null, '\t')
            fs.writeFile(tweetPath, newObj, (err)=> { // use append
              if(err) throw err;
            })
          })
      })
    } else if(method === 'GET'){
      fs.readFile(tweetPath, (err, data) =>{
        if(err) throw err;
        res.write(data.toString());
        res.end()
      })
    }
  }

})

server.listen(3000, console.log('listening'))

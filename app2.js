'use strict'

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  let defEndPoint = '/tweets';
  let tweetPath = './tweets.json'
  let checkFile = fs.existsSync('./tweets.json')

let bla = [{'astf':'dasg'}, {'asagah':'hrert'}]
let ble = [{546: 'ywey'}, {6876: 'asafwtw'}]

let blable = JSON.stringify(bla.concat(ble));
console.log('concat array' + blable)

  const {method, url, headers } = req

  if(url !== defEndPoint) res.end('to got tweets')

  else if (url === defEndPoint){

    if(method === 'POST'){
      let body = [];
      req.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk)=>{
        // console.log(chunk)
        body.push(chunk);
      }).on('end', ()=>{

        body = Buffer.concat(body).toString(); //buffer into string
        // console.log(body)
        body = JSON.parse(body) //object looking string into json
        // console.log(body)

        //no file, create the file
        if(!checkFile){
          console.log('file not present')
          let tweets = {};
          tweets.tweets = body
          
          console.log(JSON.stringify(tweets))
          fs.writeFile(tweetPath, JSON.stringify(tweets), (err) => {
            if (err) throw err;
          })
          console.log('file created, tweets saved')

          // file exists

        } else if(checkFile) {
          console.log('file present')
          fs.readFile(tweetPath, 'utf8', (err,data) =>{ // read file
            if(err) throw err;
            // data = [] // ask about this!!!!
            // console.log('body ', body)
            // let newTweets = data.concat(body)
            body = JSON.stringify(body, null, '\t')
            fs.appendFile(tweetPath, body, (err)=> { // use append
              if(err) throw err;

              // body = JSON.stringify(body, null, '\t') //importante
            })
          })

        }

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


const fs = require('fs')

const Utils = {}
module.exports = Utils

const APIEndPoint = '/api/tweets';
const tweetPath = './tweets.json'
Utils.readBody = (req) => {
  // console.log(req.on)
  return new Promise ((resolve,reject) => {
    // console.log('here')
    let body =[]
    req.on('error', (err) => {
      console.error(err)
      return resolve(err)
    }).on('data', (chunk) =>{
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      // body = JSON.parse(body)

      return resolve(body)
    })
  })
}

Utils.dataToTweet = (data) => {
let tweetObject = {}
console.log(typeof data)
data.split('&').forEach((pair) => {
  pair = pair.split('=')
  tweetObject[pair[0]] = decodeURIComponent(pair[1].replace(/\+/g, ' '))
})
const tweetArray = [tweetObject]
// console.log(tweetArray)
return tweetArray
}

Utils.processBody = (body) => {
  console.log(body)
  const query = body.split('=')
  console.log(query)
  const user = query[1].split('&')[0]
  console.log(user)
  const tweet = query[2].split('&')[0]
  console.log(tweet)
  const string = tweet.split('+').join(' ')
  let obj = [{user:user, tweet:tweet}] // objectAssign
  const tweetObj = JSON.parse(JSON.stringify(obj).split('+').join(' '))
  return Promise.resolve(tweetObj)
}

Utils.resRedirectHome = (res) => {
  res.writeHead(302, {Location: 'http://localhost:3000/'})
  res.end()
}

// Utils.getAPITweetID = (url) => {
//   let id = url.split('/')[3]
//   if(!id) return null
//   return id
// }

Utils.resSendTweetsAPI = (res) =>{
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{'message': 'Data Recieved'}`)
}
Utils.resUpdateTweetAPI = (res,id) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{"message": "Tweet ${id} Updated"}`)
}
Utils.resDeleteTweetAPI = (res,id) => {
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
  res.end(err.message) // important
}
Utils.resTweetNotFound = (res,id) => {
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(`{'message': 'Tweet ${id} not found'}`)
}
Utils.resWebGetAllTweets = (res,html) => {
  res.writeHead(200,{'Content-Type':'text/html'})
  res.end(html)
}
Utils.resWebGetSingleTweet = (res, html) => {
  res.writeHead(200,{'Content-Type':'text/html'})
  res.end(html)
}

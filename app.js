'use strict'

const http = require('http');

const query = () => { //use later
  let url = req.url.split('?')[1]
  url = url.split('&')
  console.log('url & '+url);

  let obj = {}
  let queryObj = {}

  url.map(url =>{
    const key = url.split('=')
    console.log('key = ' + key)
    const value = key[1].replace(/\+/g, ' ')
    console.log('value = ' + value)
    obj = {[key[0]] : value}
    console.log('object ' + obj)

    queryObj = Object.assign(queryObj, obj)
    console.log('query object ' + queryObj)
  })
  return queryObj
}
// const location = () => { // ask later
//   let loc = req.url.split('/')
//   loc = loc[1]
//   return loc
// }
const server = http.createServer((req, res) => {
  console.log(req.url)
  if(req.url === '/'){
    res.write(`<html><h1>We are in the ${req.url} </h1></html>`)
  }else if(req.url === '/home'){
    res.write(`<html><h1>We are in ${req.url} </h1></html>`)
  }else if(req.url === '/bla'){
    res.write(`<html><h1>We are in ${location()} </h1></html>`)
  }


})

server.listen(3000,()=>{
  console.log('running on 3000')
})

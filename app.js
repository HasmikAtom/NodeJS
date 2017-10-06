'use strict'

const http = require('http');
const fs = require('fs');

const location = (url) => { // !!!!!!!!!!!!
  let loc = url.split('/')
  loc = loc[1]
  console.log(loc)
  return loc
}
const searchQuery = (url) =>{
  let query = url.split('?')[1]
  if (!query) return null
  query = query.split('&')
  let obj = {}
  let queryObj = {}
  query.map(query => {
    const searchKeys = query.split('=')
    console.log('searchKeys ' + searchKeys)
    if (!searchKeys[1]) return
    const searchValue = searchKeys[1].replace(/\+/g, ' ')
    console.log('searchValue ' + searchValue)
    obj = {[searchKeys[0]] : searchValue}
    console.log('obj ' + obj)
    queryObj = Object.assign(queryObj, obj)
    console.log('queryObj ' + queryObj)
  })
  return queryObj
}
const server = http.createServer((req, res) => {
  console.log(req.url)
  let url = req.url
  let search = '/search?t='
  let string = JSON.stringify(searchQuery(url))

  if(req.url === '/favicon.ico'){
    return null
  }else if(url === '/home' || req.url === '/'){
    res.write(`<html><h1>We are in ${location(url)} </h1></html>`)
  }else if(url === '/random'){
    res.write(`<html><h1> Searching for ${location(url)}  </h1></html>`)
  }else if(url.includes(search)){
    res.write(`<html><h1> Searching for ${string}  </h1></html>`)
  }

res.end()
})

server.listen(3000, console.log('listening'));

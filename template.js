const fs = require ('fs');
const templateAll =  './public/tweets.hbs'
const templateSingle =  './public/tweet.hbs'
const Handlebars = require('handlebars');

const Template = {};
module.exports = Template;

Template.allTweets = (res, data) => {
  fs.readFile(templateAll, 'utf-8', function(err, source){
    if (err) throw err;
    var template = Handlebars.compile(source);
    if(data) {
      var html = template({tweets: data});
    } else {
      var html = template({})
    }
    res.end(html)
  })
}

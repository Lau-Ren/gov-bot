
require('dotenv').config()
var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async/series');
var Twit = require('twit');
// var config = require('./config.js');
 
var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,  
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,  
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


runBot()

function runBot(){

  Promise.all([getBills(),getLastTweet()]).then(function(res){
      var httpRegex = /http*/g

      var billsToTweets= res[0];
      var latestBill = billsToTweets[0];
      var lastTweetBill = res[1];
       
      var httpIndexLastTweet = httpRegex.exec(lastTweetBill).index;
      var httpIndexBillToTweet = httpRegex.exec(latestBill).index

      var lastTweetsTitle = lastTweetBill.substr(0, httpIndexLastTweet - 1);
      var billToTweetTitle = latestBill.substr(0, httpIndexBillToTweet -1);
    

      // after initial flurry
      if(billsToTweets.length && 
        latestBill &&
        lastTweetBill && 
        lastTweetBill.length > 1 &&
        lastTweetsTitle !== billToTweetTitle
      ){
        // console.log('trying to post', '\n',billsToTweets[0],'\n', lastTweetBill)
        postTweet(billsToTweets[0])
      }

      // // initial twitter flurry
      // var tweetsArray = [];

      //  for (var i = 0; i <= billsToTweets.length - 1; i++) {
      //   var tweet = billsToTweets[i]
      //   tweetsArray.push(postTweet(tweet))  

      // }

      // function run(){
      //   var fn = tweetsArray.shift();
      //   if(!fn){
      //     console.log('Done');
      //   } else {
      //     fn(run);
      //   }
      // }

      // run();
  })
}

function getBills() {
   var url = 'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/';
   var basUrl = 'https://www.parliament.nz'

  return new Promise(function (resolve, reject) {
    request(url, function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);
        var billRows = $('.list__cell-heading')
        var bills = [];
        for (var i = billRows.length - 1; i >= 0; i--) {
      
          var billTitle = billRows[i].attribs.title;
          var billPath =  billRows[i].attribs.href;
          var fullBillLink = basUrl + billPath
          var beginingUrl = billPath.slice(0, 50)
          var correctBillPath = '/en/pb/bills-and-laws/bills-proposed-laws/document';
          var startLen = billRows.length

          if(billTitle.length && beginingUrl === correctBillPath){
           
            var billTweet = billTitle + ' ' + fullBillLink;

            bills.unshift(billTweet)
          }
        }
        console.log('\nRetrieved bills\n')
        resolve(bills);
      } else {
        console.error('\nFailed to retrieve bills\n', error)
        reject(error)
      }
    })
  })
}

function getLastTweet() {
  var lastTweet = '';
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', {}, function(error, data, response) {

      if(!error){
        if(data[0]){
           lastTweet = data[0].text
        }
        
        console.log('\n Retrieved last tweet\n')
        resolve(lastTweet);
      } else {
        console.error('\n Failed to retrieve last tweet\n', error)
        reject(error)
      }
    })
  })
}

function postTweet(tweet){
  return new Promise(function (resolve, reject) {
    return T.post('statuses/update', { status: tweet }, function(error, data, response) {
      if(!error){
      
        console.log('\nPOSTED: ', tweet)
        resolve(response);
      } else {
        console.error('\nFailed to post tweet\n',error)
        reject(error)
      }
    })
  })
    
}


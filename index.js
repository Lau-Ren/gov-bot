
require('dotenv').config()
var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async/series');
var Twit = require('twit');
const postTweet = require('./scripts/post-tweet');
const getLatestBills = require('./scripts/get-latest-bills');
// var config = require('./config.js');

var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


runBot();

// getBillDetails('https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/document/BILL_84939/financial-markets-derivatives-margin-and-benchmarking')

function runBot() {

  Promise.all([getLatestBills(), getOldTweets()])
    .then(function ([newBills, oldTweets]) {
      return Promise.all(newBills.map((bill) => {
        if(bill &&
          bill.length > 0 &&
          shouldPostBill(bill, oldTweets)
        ){
          postTweet(bill)
        } 
      }))
  
    }).catch((error) => {
      console.log('Error running bot', error)
    })
}

function shouldPostBill(bill, oldTweets) {
  let oldTweetText = oldTweets.map(({text}) => text)
  //if bill undefined, its not found and can be posted
  let postIt = !oldTweetText.find((text) => {
    return text.indexOf(bill.substring(0, 20)) >= 0
  })

  return postIt;
}

function getOldTweets() {
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', {
      exclude_replies: true,
      include_rts: false,
      trim_user: true,
      count: 200,
    }, function (error, data, response) {

      if (!error) {
        resolve(data);
      } else {
        console.log('\n Failed to retrieve last tweet\n', error)
        reject(error)
      }
    })
  })
}
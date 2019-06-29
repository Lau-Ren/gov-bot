var Promise = require('promise');
var Twit = require('twit');

var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
  

module.exports = function(tweet) {
    console.log('tweet - ', tweet)
    return new Promise(function (resolve, reject) {
      return T.post('statuses/update', { 
        status: tweet,
      }, function (error, data, response) {
        if (!error) {
          console.log('\nPOSTED: ', data)
          resolve(response);
        } else {
          console.log('\nFailed to post tweet\n', error)
          reject(error)
        }
      })
    })
  
  }
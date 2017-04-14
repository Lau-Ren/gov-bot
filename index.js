
var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async/series');
var Twit = require('twit');
var config = require('./config.js');
 
var T = new Twit(config);


runBot()

function runBot(){

  Promise.all([getBills(),getLastTweet()]).then(function(res){
  
      var billsToTweets= res[0]
      var lastTweetBill = res[1]
       
      // after initial flurry
      // if(billsToTweets.length && lastTweetBill && billsToTweets[0] !== lastTweetBill ){
      //   postTweet(billsToTweets[0])
      // }

      // initial twitter flurry
      var tweetsArray = [];

       for (var i = 0; i <= billsToTweets.length - 1; i++) {
        var tweet = billsToTweets[i]

        tweetsArray.push(postTweet(tweet))  
        // tweetsArray.push(postTweet(tweet))

        // tweetsArray.push(function(callback) {
        //   postTweet(tweet, callback)
        //     // setTimeout(function(err, res){
        //     //   console.log('IN the First thing')
        //     //   callback(err, res);
        //     // }, 500)
        //   })

      }

      function run(){
        var fn = tweetsArray.shift();
        if(!fn){
          console.log('Done');
        } else {
          fn(run);
        }
      }

      run();
   // console.log('tweetsArray', tweetsArray)

    //   async(tweetsArray, function(error, results){

    //     console.log('error', error);
    //     console.log('results', results);
      
    //     if(!error){
    //       console.log('finished');
    //     } else {
    //       console.log(error);
    //     }
      
    //   });

    // }).catch(function(reason){ 
    //   console.log('reason',reason)
    // });
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

        resolve(bills);
      } else {
        reject(error)
      }
    })


  })


    
}

function getLastTweet() {
  var lastTweet = 'no tweet';
  return new Promise(function (resolve, reject) {
    T.get('statuses/user_timeline', {}, function(error, data, response) {

      if(!error){
        if(data[0]){
           lastTweet = data[0].text
        }

        resolve(lastTweet);
      } else {
        reject(error)
      }
    })
  })


}

function postTweet(tweet){
  return new Promise(function (resolve, reject) {
    return T.post('statuses/update', { status: tweet }, function(error, data, response) {
    
        console.log('...posting... ', tweet)
        resolve(response);
      
    })
  })
    
}



var request = require('request');
var cheerio = require('cheerio');

var Twit = require('twit');
var config = require('./config.js');
 
var T = new Twit(config);

getBills()

function getBills() {
   var url = 'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/';
   var basUrl = 'https://www.parliament.nz'

  request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var billRows = $('.list__cell-heading')
            var bills = []

           

            for (var i = billRows.length - 1; i >= 0; i--) {
          
              var billTitle = billRows[i].attribs.title;
              var billPath =  billRows[i].attribs.href;
              var fullBillLink = basUrl + billPath
              var beginingUrl = billPath.slice(0, 50)
              var correctBillPath = '/en/pb/bills-and-laws/bills-proposed-laws/document';
              var startLen = billRows.length

               // console.log('here: ', billTitle.length, beginingUrl === correctBillPath)

              if(billTitle.length && beginingUrl === correctBillPath){
               
                var tweet = billTitle + ' ' + fullBillLink;

                bills.unshift(tweet)
              }


             
            }

         console.log('\n Lengths: ', bills[0]);

        }
    })
}

function getLastTweet() {
  return T.get('statuses/user_timeline', {}, function(err, data, response) {

    if(!err){
      lastTweet = data[0].text
      console.log('DATA: ', data[0].text)
    }

  })

}



// T.post('statuses/update', { status: 'testing' }, function(err, data, response) {
//   "https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/"
//   // console.log(data)
// })
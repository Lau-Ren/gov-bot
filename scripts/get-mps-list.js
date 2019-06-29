

var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var cleanName = require('./clean-name')
getMPs();

function getMPs(){
  var url = 'https://www.parliament.nz/en/mps-and-electorates/members-of-parliament/';

  return new Promise(function (resolve, reject) {
    request(url, function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);

        var mps = []

        $('.list__row').each((i, el) => { 
          var mpDataString = $(el).text();

          var mpDataStringSplit = mpDataString.split('\n').filter((i) => i.trim() );
          var name = cleanName(mpDataStringSplit[0])

          var party = mpDataStringSplit[1].trim();
          mps.push({ name, party });
        })
        console.log('\nmps- ', JSON.stringify(mps, null, 2))
        resolve(mps);
      } else {
        console.log('\nFailed to retrieve mps\n', error)
        reject(error)
      }
    })
  })
}

var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var cleanName = require('./clean-name')
var allMPs = require('../mp-data');
var allParties = require('../party-data');
var govBaseUrl = 'https://www.parliament.nz'

function tap (output, topic) {
  let strLength = 100;
  if(output.length > 0){
    console.log(`Example output: `, JSON.stringify(output[0]).substring(0, strLength)) 
  } else {
    console.log('Example output: ', JSON.stringify(output).substring(0, strLength))
  }
  console.log(`\n`)
  return output;
}

module.exports = function getLastestBills() {
  return scrapeBills()
    .then((x) => tap(x, 'SCRAPED BILLS'))
    .then(scrapeBillDetails)
    .then((x) => tap(x, 'SCRAPED BILL DETAILS'))
    .then(makeTweets)
    .then((x) => tap(x, 'MADE TWEETS'))
    .catch((err) => {
      console.log('\nError\n', err)
      
    })
}

function scrapeBillDetails (bills) {
  
  return Promise.all(bills.map((bill) => {
    return new Promise((resolve, reject) => {
      request(bill.fullHref, function (error, response, html) {
        if (!error) {
          let $ = cheerio.load(html);
          let htmlText = $(html).text()
          if(htmlText.includes('HTTP Error 400')){
            throw Error(billUrl + '\n' + htmlText)
          }
  
          let mpName = scrapeMpsName(html);
          let { handle, party } = translateNameToMpDetails(mpName);
          let partyHandle = getPartyHandle(party);
          
          resolve(Object.assign(bill, {
            ...(mpName && { mpName: mpName }),
            ...(partyHandle && { partyHandle: partyHandle }),
            ...(handle && { mpHandle: handle })
            
            
          }));
        } else {
          console.log('\nFailed to retrieve bills details\n', error)
          reject(error)
        }
      })
    })
  }))
}

function scrapeBills() {
  var url = 'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/?Criteria.PageNumber=1&Criteria.DocumentStatus=Current&Criteria.Sort=PublicationDate&Criteria.Direction=Descending';
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, html) {
      if (!error) {
        let $ = cheerio.load(html);
        let billRows = $('.list__cell-heading')
        resolve(Object.keys(billRows)
          .filter(x => !Number.isNaN(Number(x)))
          .map((i) => {
            let latest = billRows[i]
            let { title, href } = latest.attribs;
            // encode so macrons dont fuck it up
            let fullHref = govBaseUrl + encodeURI(href)
            return {title, fullHref};
          }));
      } else {
        console.log('\nFailed to retrieve bill\n', error)
        reject(error)
      }
    })
  })
}

function makeTweets(bills) {
  return bills.map(({ mpName, mpHandle, partyHandle, title, fullHref }) => `${title ? title + ' ' : ''}${mpHandle ? mpHandle + ' ' : ''}${partyHandle ? partyHandle + ' ' : ''}${fullHref ? fullHref + ' ' : ''}#nzgovbot`);
}

function scrapeMpsName(html) {
  let $ = cheerio.load(html);
  if($(html).text().includes('HTTP Error 400')){
    throw Error('HTTP Error')
  }
  let billDetails = $('.bill-info__section--graphic')
  let el = billDetails;
  let billDataString = $(el).text();
  let billDataStringSplit = billDataString.split('\n').filter((i) => i.trim());
  return cleanName(billDataStringSplit[1]);
}
  
function translateNameToMpDetails(mpName) {
  if (!mpName) {
    console.log('Error mp name undefined')
    return;
  }
  return allMPs.find((mp) => mp.name === mpName)
}
  
  
function getPartyHandle(mpParty) {
  if (!mpParty) {
    console.log('Error mp party undefined');
    return;
  }
  var partyDetails = allParties.find((party) => party.name === mpParty)
  return partyDetails.handle;
}
  

  
  
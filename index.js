const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const fs = require("fs");
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'R and D OCR-7b8c5a0be5e0.json'
});

global.email = '';
global.number = 1;
global.name = '';
global.mobile = '';
global.tel = '';

client
  .textDetection('/app/img/1.jpg')
  .then(results => {
    const detections = results[0].textAnnotations;
    console.log('==============================');
    console.log('            Detect            ');
    console.log('==============================');
    console.log(detections[0].description);
    console.log('==============================');
    validateEmail(detections[0].description);
    validateTel(detections[0].description);
    validateName(detections[0].description);
    if (global.email == '') {
      console.log('Email : ');
    }
    if (global.mobile == '') {
      console.log('Tel : ');
    }
    console.log('==============================');
    })

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
    var tagline = "Any code of your own that you haven't looked at for six or more months might as well have been written by someone else.";

    res.render('pages/index', {
        drinks: drinks,
        tagline: tagline
    });

  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


function validateEmail(email) {
  var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))( |)@( |)((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  if (email.match(re)) {
    global.email = email.match(re)[0];
    console.log('Email : ' + global.email);
  }
  // return re.test(email);
}

function validateTel(tel) {
  const n = tel.length;
  var i = 0, sentence = '';
  var re = /(\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})|\+?([0-9]{2,3})\)?[-. ]?([0-9]{3,5})[-. ]?([0-9]{4}))/;
  while (i <= n) {
    sentence = sentence + tel[i];
    if (tel[i] == '\n') {
      if (sentence.match(re)) {
        // check Tel number
        if (sentence.indexOf('02') != -1) {
          if (global.tel == '') {
            global.tel = sentence.match(re)[0];
          }
          else{
            global.tel = global.tel + ',' + sentence.match(re)[0];
          }
        }
        // check Mobile number
        else{
          if (global.mobile == '') {
            global.mobile = sentence.match(re)[0];
          }
          else{
            global.mobile = global.mobile + ',' + sentence.match(re)[0];
          }
        }
      }
      sentence = '';
    }
    i++;
  }
  console.log('Tel : ' + global.tel);
  console.log('Mobile : ' + global.mobile);
}

function validateName(name) {
  const n = name.length;
  var i = 0, sentence = '';
  var re = /([a-zA-Z]{3,20} [a-zA-z]{3,20})/;
  while (i <= n) {
    sentence = sentence + name[i];
    if (name[i] == '\n') {
      if (sentence.match(re)) {
        if (global.name == '') {
          global.name = sentence.match(re)[0];
        }
        else{
          global.name = global.name + ',' + sentence.match(re)[0];
        }
      }
      sentence = '';
    }
    i++;
  }
  console.log('Name : ' + global.name);
}

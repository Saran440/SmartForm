const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const config = require('./config/config')
const fs = require("fs");
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'R and D OCR-7b8c5a0be5e0.json'
});
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(`.${config.pathImg}${config.folderdb}/data`);

global.email = '';
global.number = 1;

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS lorem (pathImg TEXT, textAll TEXT, text_email TEXT, text_tel TEXT, text_mobile TEXT, text_name TEXT)");

  // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  var stmt = db.prepare("INSERT INTO lorem VALUES (?,?,?,?,?,?)");

  stmt.run("Ipsum","999");
  stmt.finalize();

  db.each("SELECT *, rowid AS id FROM lorem ORDER BY id DESC LIMIT 1", function(err, row) {
      console.log(`${row.id} : ${row.pathImg} | ${row.textAll} | ${row.text_email}`);
  });
});

db.close();


//check folder update
fs.watch(`${__dirname}${config.pathImg}${config.folderImg}`, { encoding: 'buffer' }, (eventType, filename) => {
  console.log(filename +'...');
  if (filename && global.number%2 == 1) {
      global.name = '';
      global.mobile = '';
      global.tel = '';
      global.url = '';
      global.imagePath = `/${config.folderImg}/${filename}`;

      //detectText by using API
      client
        .textDetection(`${__dirname}${config.pathImg}${config.folderImg}/${filename}`)
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
          validateUrl(detections[0].description);
          if (global.email == '') {
            console.log('Email : ');
          }
          if (global.mobile == '') {
            console.log('Tel : ');
          }
          console.log('==============================');
          global.textAll = detections[0].description;
          })

        .catch(err => {
          // console.error('ERROR:', err);
        });
        global.number++;
  }
  else{
    global.number++;
  }
})

//open localhost
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    // send REST API data
    var detectText = [
        { textAll: global.textAll, email: global.email, tel: global.tel, mobile: global.mobile, name: global.name, imagePath: global.imagePath }
    ];
    res.render('pages/index', {
        detectText: detectText
    });

  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


function validateEmail(email) {
  var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))( |)@( |)((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
  if (email.match(re)) {
    global.email = email.match(re)[0];
    console.log(`Email : ${global.email}`);
  }
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
            global.tel = `${global.tel},${sentence.match(re)[0]}`
          }
        }
        // check Mobile number
        else{
          if (global.mobile == '') {
            global.mobile = sentence.match(re)[0];
          }
          else{
            global.mobile = `${global.mobile},${sentence.match(re)[0]}`
          }
        }
      }
      sentence = '';
    }
    i++;
  }
  console.log(`Tel : ${global.tel}`);
  console.log(`Mobile : ${global.mobile}`);
}

function validateName(name) {
  const n = name.length;
  var i = 0, sentence = '';
  var re = /-( |)([a-zA-Z]{2,20} [a-zA-z]{2,20})(-|)/;

  // check all character
  while (i <= n) {
    sentence = sentence + name[i];
    // check if char is \n (= 1 word)
    if (name[i] == '\n') {
      // check sentence that match regular expression
      if (sentence.match(re)) {
        if (global.name == '') {
          global.name = sentence.match(re)[2];
        }
        else{
          global.name = `${global.name},${sentence.match(re)[2]}`
        }
      }
      sentence = '';
    }
    i++;
  }
  console.log(`Name : ${global.name}`);
}

function validateUrl(url) {
  const n = name.length;
  var i = 0, sentence = '';
  var re = /www[.].+[.]\w+([.]\w+|)/;

  // check all character
  while (i <= n) {
    sentence = sentence + name[i];
    // check if char is \n (= 1 word)
    if (name[i] == '\n') {
      // check sentence that match regular expression
      if (sentence.match(re)) {
        console.log('-------------url-----' + sentence.match(re)[0]);
        if (global.url == '') {
          global.url = sentence.match(re)[0];
        }
        else{
          global.url = `${global.url},${sentence.match(re)[0]}`
          }
        }
      sentence = '';
      }
    i++;
    }
  console.log(`URL : ${global.url}`);
  }

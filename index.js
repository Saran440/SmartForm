const express = require('express')
var bodyParser = require('body-parser');
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
global.test = 'www.ssd.com';

//check folder update
fs.watch(`${__dirname}${config.pathImg}${config.folderImg}`, { encoding: 'buffer' }, (eventType, filename) => {
  console.log(filename +'...' + eventType);

  if (filename && eventType == 'rename') {
      global.name = '';
      global.mobile = '';
      global.tel = '';
      global.url = '';
      global.position = '';
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
          validatePosition(detections[0].description);
          if (global.email == '') {
            console.log('Email : ');
          }
          if (global.mobile == '') {
            console.log('Tel : ');
          }
          console.log('==============================');
          global.textAll = detections[0].description;

          db.serialize(function() {
            db.run("CREATE TABLE IF NOT EXISTS sourceTable (pathImg TEXT, textAll TEXT, text_email TEXT, text_tel TEXT, text_mobile TEXT, text_name TEXT, text_position TEXT, text_url TEXT)");

            // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
            var stmt = db.prepare("INSERT INTO sourceTable VALUES (?,?,?,?,?,?,?,?)");

            stmt.run(`${__dirname}${config.pathImg}${config.folderImg}/${filename}`, `${detections[0].description}`, `${global.email}`, `${global.tel}`, `${global.mobile}`, `${global.name}`,`${global.position}`,`${global.url}`);
            stmt.finalize();

            db.each("SELECT *, rowid AS id FROM sourceTable ORDER BY id DESC LIMIT 1", function(err, row) {
                console.log(`${row.id} : ${row.pathImg} | ${row.text_email} | ${row.text_tel} | ${row.text_mobile} | ${row.text_name} | ${row.text_position} | ${row.text_url}`);
            });
          });

          db.close();

          })

        .catch(err => {
          // console.error('ERROR:', err);
        });


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
        { textAll: global.textAll, email: global.email, tel: global.tel, mobile: global.mobile, name: global.name, url: global.url, position: global.position, imagePath: global.imagePath }
    ];
    res.render('pages/index', {
        detectText: detectText
    });

  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

express().post('/', bodyParser.json(), function(req, res) {
      console.log('gooooooooood');
  });


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
  const n = url.length;
  var i = 0, sentence = '';
  var re = /www[.].+[.]\w+([.]\w+|)/;

  // check all character
  while (i <= n) {
    sentence = sentence + url[i];
    // check if char is \n (= 1 word)
    if (url[i] == '\n') {
      // check sentence that match regular expression
      if (sentence.match(re)) {
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

  function validatePosition(position) {
    const n = position.length;
    var i = 0, sentence = '';
    var re = /[*]( |)(.+)[*]/;

    // check all character
    while (i <= n) {
      sentence = sentence + position[i];
      // check if char is \n (= 1 word)
      if (position[i] == '\n') {
        // check sentence that match regular expression
        if (sentence.match(re)) {
          if (global.position == '') {
            global.position = sentence.match(re)[2];
          }
          else{
            global.position = `${global.position},${sentence.match(re)[2]}`
            }
          }
        sentence = '';
        }
      i++;
      }
    console.log(`Position : ${global.position}`);
  }

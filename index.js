const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const vision = require('@google-cloud/vision');
const fs = require("fs");
// var http = require('http');
var express = require('express');
var app = express();
// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'R and D OCR-7b8c5a0be5e0.json'
});

global.email = '';
global.number = 1;
let path = "/Users/User/ocr/image";
var n = 1;

// check path when update image
fs.watch(path, { encoding: 'buffer' }, (eventType, filename) => {
  if (filename && global.number%2 == 1) {
      global.name = '';
      global.mobile = '';
      global.tel = '';
      client
        .textDetection(path + '/' + filename)
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

          // app.get('/', function (req, res) {
          //   res.json( {textAll: detections[0].description,
          //     email: global.email,
          //     Tel: global.tel,
          //     Mobile: global.mobile,
          //     Name: global.name});
          //    // fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
          //    //     console.log( data );
          //    //     res.end( data );
          //    // });
          // })


          if (n==1) {
            var server = app.listen(8080, function () {

              var host = server.address().address
              var port = server.address().port
              console.log("Example app listening at http://%s:%s", host, port)

            })
          }
          n++
          // fs.readFile('3.jpg' , (err, data) => {
          //   if (err) throw err;
          //   let base64Image = new Buffer(data, 'binary').toString('base64');
          // });
          //
          // var server = http.createServer();
          // server.on('request', (req, res) => {
          //   res.writeHead(200, {'Content-Type' : 'text/html'});
          //   res.write('Email : ' + global.email + '<br>');
          //   res.write('Tel : ' + global.tel + '<br>');
          //   res.write('Mobile : ' + global.mobile + '<br>');
          //   res.write('Name : ' + global.name + '<br>');
          //   res.end('<form action="" method="post"> Text : <textarea rows="10" cols="70">'+ detections[0].description +
          //   '</textarea><br> Email : <textarea rows="1" cols="35">' + global.email +
          //   '</textarea><br> Tel : <textarea rows="1" cols="20">' + global.tel +
          //   '</textarea><br> Mobile : <textarea rows="1" cols="20">' + global.mobile +
          //   '</textarea><br> Name : <textarea rows="1" cols="70">' + global.name + '</textarea></form>'); //end the response
          // })
          // if (n == 1) {
          //   server.listen(8080);
          // }
          // n++;
        })
        .catch(err => {
          // console.error('ERROR:', err);
        });
      global.number++;
  }
  else {
    global.number++;
  }
});

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



express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    res.json( {textAll: detections[0].description,
      email: global.email,
      Tel: global.tel,
      Mobile: global.mobile,
      Name: global.name});
    res.render('pages/index'
  }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const express = require('express');
const app = express();
const axios = require('axios');

axios.defaults.headers.common = {
  "Content-Type": "application/json"
}
app.use(express.json())
app.use('/qrcodes', express.static('qrcodes'));

let webhook = null;
const fs = require('fs');
const venom = require('venom-bot');

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  if (index == 2){
    webhook = val
  }
  webhook = 'http://localhost:5000/bot';
  console.log("WEBHOOK ---------");
  console.log(webhook);
});


let client_main = null;

/*venom
  .create(
    'T123',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], 'base64');

      var imageBuffer = response;
      require('fs').writeFile(
        'qrcodes/out.png',
        imageBuffer['data'],
        'binary',
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    undefined,
    { logQR: false }
  )
  .then((client) => {
      let time = 0;
  client.onStreamChange((state) => {

    console.log('Connection status: ', state);

    clearTimeout(time);
    if(state === 'CONNECTED'){
     start(client);
    }
   //  DISCONNECTED when the mobile device is disconnected
    if (state === 'DISCONNECTED' || state === 'SYNCING') {
      time = setTimeout(() => {
        client.close();
       // process.exit(); //optional function if you work with only one session
      }, 80000);
    }
  })
  .catch((erro) => {
     console.log('There was an error in the bot', erro);
  });
  });
*/

venom
  .create(
    'test123',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      console.log(attempts)
if (attempts == 5){
process.exit(1);
}
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};


      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], 'base64');

      var imageBuffer = response;
      require('fs').writeFile(
        'qrcodes/out.png',
        imageBuffer['data'],
        'binary',
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    undefined,

    { logQR: false,
      headless: true,
      autoClose: false }
  )
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
    client_main = client
  client.onMessage((message) => {
    console.log(webhook);
  if (webhook != null){
   // console.log(typeof message);
   // console.log(message);
    console.log(message.body);
    axios.post(webhook, message)
    .then((res) => {
        console.log(`Status: ${res.status}`);
        console.log('Body: ', res.data);
    }).catch((err) => {
        console.error(err);
    });
  }


  });
}


app.get ('/display_qrcode', function (req, res){
  console.log ('GET /');
  res.send('<img src="qrcodes/out.png" alt="QRCode">');
  });

app.post('/send_text_message', (req, res) => {
    //console.log("Data Received --------- ")
    //console.log(req)
    //console.log("Data End ------------")
    const text = req.body.text
    let mobile = req.body.chatId
    //console.log(client_main);
    if (mobile.toString().includes(".us")){
        mobile = mobile.toString()
    }else{
        mobile = mobile.toString()+'@c.us'
    }

    client_main.sendText(mobile, text)
  .then((result) => {
   // console.log('Result: ', result); //return object success
    res.send('Success')
  })
  .catch((erro) => {
    console.error('Error when sending: ', erro); //return object error
    res.send('Fail')
  });
});



app.post('/send_image', (req, res) => {
    console.log("Data Received --------- ")
    console.log(req)
    console.log("Data End ------------")
    const mobile = req.body.mobile
    const filename = req.body.filename
    const caption = req.body.caption
    const image_url = '/Users/mac/VisualStudioProjects/new-venom/out.png'//req.body.image_url

  console.log("------------");
  console.log(mobile);
  console.log(filename);
  console.log(caption);
  console.log(image_url);

  console.log("------------");

  client_main
  .sendImage(
    mobile.toString()+'@c.us',
    image_url,
    filename,
    caption
  )
  .then((result) => {
    console.log('Result: ', result); //return object success
  })
  .catch((erro) => {
    console.error('Error when sending: ', erro); //return object error
  });

});




app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});

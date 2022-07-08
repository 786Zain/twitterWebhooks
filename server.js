// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello Zain\n');
// }).listen(3000, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');

var express = require('express');
var request = require('request');
const crypto = require('crypto');

var app = express();

// Configuring Body Parser middleware to parse the incoming JSON and Url-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// crc_token validation
app.get('/webhook', function(req, res) {
  	var crc_token = req.query.crc_token;
    if (crc_token) {
      var hash = crypto.createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET).update(crc_token).digest('base64');
      
      res.status(200);
      res.send({
        response_token: 'sha256=' + hash
      })
    } else {
      res.status(400);
      res.send('Error: crc_token missing from request.')
   }
});

app.post('/webhook', function (req, res) {
	var message_data;
	var sender_id;
	var metadata;
	var response;
	var oauth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token: process.env.TWITTER_ACCESS_TOKEN,
      token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    }

    // check for direct message events
    if(payload.direct_message_events) {
  
      // loop through each event
      payload.direct_message_events.forEach(message_event => {
  
        // check if event is a message_create event and if it is incoming by validating sender ID
        if(message_event.type == 'message_create' && message_event.message_create.sender_id !== TWITTER_PAGE_ID) {
          
          // process each event individually
		    message_data=message_event.message_create.message_data;
		    // check for quick reply response
		    if(message_event.message_create.message_data.quick_reply_response) {
		      // access the metadata of the quick reply response
		      metadata = message_event.message_create.message_data.quick_reply_response.metadata
		    }
		    // user submitted free form messsage
		    else {
		      metadata = 'default_message' 
		    }

		    // access sender of the message to reply to
		    sender_id = message_event.message_create.sender_id
        }
      });

      response = {
	      "event": {
	        "type": "message_create",
	        "message_create": {
	          "target": {
	            "recipient_id": undefined
	          },
	          "message_data": {
	            "text": undefined,
	          }
	        }
	      }
	    }
	  
	    msg.event.message_create.target.recipient_id = recipient_id;
	    msg.event.message_create.message_data.text = message_data;


	    // request options
	    var request_options = {
	      url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
	      oauth: oauth,
	      json: true,
	      headers: {
	        'content-type': 'application/json'
	      },
	      body: response
	    }

	    // POST request to send Direct Message
	    request.post(request_options, function (error, response, body) {
	      console.log(body)
	    })
    }
});

// Sets server port and logs message on success
const port = process.env.PORT || 1337;  
app.listen(port, () => console.log('Webhook is listening on port ' + port));

module.exports = app;
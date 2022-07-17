const dotenv = require('dotenv');
dotenv.config();
const { Autohook } = require('twitter-autohook');
var axios = require('axios');
(async start => {
    try {
        const webhook = new Autohook();

        // Removes existing webhooks
        await webhook.removeWebhooks();

        // Starts a server and adds a new webhook
        await webhook.start();

        // Subscribes to your own user's activity
        await webhook.subscribe({ oauth_token: process.env.TWITTER_ACCESS_TOKEN, oauth_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET });
        webhook.on('event', async event => {
            if (event.direct_message_events) {

                const message = event.direct_message_events.shift();
                console.log(message)
                await sayHi(event, message);
            }

            // We check that the message is a direct message
            if (!event.direct_message_events) {
                return;
            }

            // We check that the message is valid
            if (typeof message === 'undefined' || typeof message.message_create === 'undefined') {
                return;
            }

            // We filter out message you send, to avoid an infinite loop
            if (message.message_create.sender_id === message.message_create.target.recipient_id) {
                return;
            }
            // Prepare and sent the message reply
            async function sayHi(event, message) {
                const senderScreenName = await event.users[message.message_create.sender_id].screen_name;
             
                var data = JSON.stringify({
                    "event": {
                        "type": "message_create",
                        "message_create": {
                            "target": {
                                "recipient_id": message.message_create.sender_id
                            },
                            "message_data": {
                                "text": `Hi @${senderScreenName}! 👋`
                            }
                        }
                    }
                });

                var config = {
                    method: 'post',
                    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
                    headers: {
                        'Authorization': 'OAuth oauth_consumer_key="QZdwTE2Zjo2hAXQZv7B7tQE3l",oauth_token="1544590012569661441-udrzOhcgyHvpN2MXAzMm9MHhsXFh4n",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1657990718",oauth_nonce="iD61mnRAIQ0",oauth_version="1.0",oauth_signature="4fnA2yBnZnCGy6stJuQ9wq%2FB2Fg%3D"',
                        'Content-Type': 'application/json',
                        'Cookie': 'guest_id=v1%3A165793424998118565; guest_id_ads=v1%3A165793424998118565; guest_id_marketing=v1%3A165793424998118565; personalization_id="v1_Vg/OuPsUIYfIGkkbMGN1iA=="; lang=en'
                    },
                    data: data
                };

                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

            }
        })
    } catch (e) {
        // Display the error and quit
        console.error(e);
        process.exit(1);
    }
})();  
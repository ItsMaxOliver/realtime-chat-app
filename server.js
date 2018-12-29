const cors = require('cors');
const next = require('next');
const Pusher = require('pusher');
const express = require('express');
const Sentiment = require('sentiment');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handler = app.getRequestHandler();
const sentiment = new Sentiment();

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: true
});

app.prepare()
    .then(() => {
        const server = express();

        // initiates a chatHistory object for us to put the chat messages in
        const chatHistory = { messages: [] };
      
        server.use(cors());
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));

        server.get('*', (req, res) => {
            return handler(req, res);
        });
      
        server.post('/message', (req, res, next) => {
            const { user = null, message = '', timestamp = +new Date } = req.body;
            
            // saves the sentiment score in a variable to be used in the chat object
            const sentimentScore = sentiment.analyze(message).score;
          
            // reconstructs the chat object with the sentiment score
            const chat = { 
                user, 
                message, 
                timestamp, 
                sentiment: sentimentScore 
            };
          
            // adds the chat to the chatHistory messages
            chatHistory.messages.push(chat);

            // triggers the pusher client with the new-message event in the chat-room channel passing the chat object
            pusher.trigger('chat-room', 'new-message', { chat });
        });
        
        // fetches all the messages in the chatHistory
        server.post('/messages', (req, res, next) => {
            res.json({ ...chatHistory, status: 'success' });
        });
        
        server.listen(port, err => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
      
    })
    .catch(ex => {
        console.error(ex.stack);
        process.exit(1);
    });
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
    
    server.use(cors());
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    server.get('*', (req, res) => {
      return handler(req, res);
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
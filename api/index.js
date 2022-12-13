const express = require('express');
const axios = require('axios');
const { getMessages } = require('../crawler/movie');

const app = express();

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

app.get('/api', (req, res) => {
  res.sendStatus(200);
});

app.post('/api/webhook', async (req, res) => {
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === 'message') {
    const input = req.body.events[0].message.text.split(' ');
    const [movieName, date] = input;
    // Message data, must be stringified
    const messages = await getMessages({
      movieName,
      date,
    });
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages,
    });

    // Request header
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    };

    try {
      const lineResponse = await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        dataString,
        {
          headers,
        },
      );
      console.log(lineResponse.data);
      // process.stdout.write(res.data)
    } catch (error) {
      console.error(error);
    }

    res.send('HTTP POST request sent to the webhook URL!');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

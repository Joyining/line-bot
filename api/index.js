const express = require('express');
const axios = require('axios');
const { getMessages, fetchTheaters } = require('../crawler/movie');
const areas = require('../constants/areas');

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

let quickReplyItems;
let quickReplyItemIndex;
let messages;
// TODO: reset quick reply method

app.post('/api/webhook', async (req, res) => {
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === 'message') {
    const input = req.body.events[0].message.text.split(' ');
    /*
      TODO: 每個使用者可以自行輸入
      指令:
      新增 欣欣秀泰影城 (或是用選項？)
      刪除 欣欣秀泰影城
      處理不同情境的 input (新增 / 刪除 / 查詢)
    */
    if (input[0] === '下一頁') {
      quickReplyItemIndex += 13;
      messages[0].quickReply.items = quickReplyItems.slice(quickReplyItemIndex - 13 - 1, quickReplyItemIndex - 1);
    } else if (input[0] === '上一頁') {
      quickReplyItemIndex -= 13;
      messages[0].quickReply.items = quickReplyItems.slice(quickReplyItemIndex - 13 - 1, quickReplyItemIndex - 1);
    } else if (input.length === 1 && input[0] === '新增') {
      quickReplyItems = [];
      areas.forEach((area, index) => {
        quickReplyItems.push({
          type: 'action',
          action: {
            type: 'message',
            label: area,
            text: `新增 ${area} 電影院`,
          },
        });
        if (index - 11 >= 0 && (index - 11) % 10 === 0) {
          quickReplyItems.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: '下一頁',
                text: '下一頁',
              },
            },
          );
          quickReplyItems.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: '上一頁',
                text: '上一頁',
              },
            },
          );
        }
      });
      messages = [{
        type: 'text',
        text: '請選擇您想要新增電影院的區域',
        quickReply: {
          items: [],
        },
      }];
      messages[0].quickReply.items = quickReplyItems.slice(0, 13);
      quickReplyItemIndex = 13;
    } else if (input.length === 3 && input[0] === '新增') {
      quickReplyItems = [];
      const area = input[1];
      const theaters = await fetchTheaters(area);
      theaters.forEach((theater, index) => {
        quickReplyItems.push({
          type: 'action',
          action: {
            type: 'message',
            label: theater,
            text: `已為您新增 ${theater}`,
          },
        });
        if (index - 11 >= 0 && (index - 11) % 10 === 0) {
          quickReplyItems.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: '下一頁',
                text: '下一頁',
              },
            },
          );
          quickReplyItems.push(
            {
              type: 'action',
              action: {
                type: 'message',
                label: '上一頁',
                text: '上一頁',
              },
            },
          );
        }
      });
      messages = [{
        type: 'text',
        text: '請選擇您想要新增的電影院',
        quickReply: {
          items: [],
        },
      }];
      messages[0].quickReply.items = quickReplyItems.slice(0, 13);
      quickReplyItemIndex = 13;
    } else {
      const [movieName, date] = input;
      // Message data, must be stringified
      messages = await getMessages({
        movieName,
        date,
      });
    }

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
      console.log(94, lineResponse.data);
      // process.stdout.write(res.data)
    } catch (error) {
      console.error(97, error);
    }

    res.send('HTTP POST request sent to the webhook URL!');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

const bodyParser = require("body-parser");
const express = require("express");
const axios = require("axios");

const bot = require("./routes/index");
const app = express();

app.use(bodyParser.json());

// bot.launch();

app.post("/", async (req, res) => {
  console.log(req.body);
  const chatId = req.body["message"]["chat"]["id"];
  const sentMessage = req.body.message.text;

  if (sentMessage.match(/hello/gi)) {
    axios
      .post(`${process.env.URL}${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "hello back 👋",
      })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else {
    // if no hello present, just respond with 200
    res.status(200).send({});
  }
});

module.exports = app;

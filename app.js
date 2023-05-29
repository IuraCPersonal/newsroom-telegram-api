const bodyParser = require("body-parser");
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const bot = require("./routes/index");
const app = express();

const Messages = require("./utils/messages");

app.use(bodyParser.json());

// bot.launch();

let file = undefined;

try {
  // reading a JSON file synchronously
  file = fs.readFileSync("database.json");
} catch (error) {
  // logging the error
  console.error(error);

  throw error;
}

const db = {};

const getLatestNews = async (topic = "reactjs") => {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=${topic}`,
    {
      headers: {
        "X-Api-Key": process.env.NEWS_TOKEN,
      },
    }
  );

  const selectedKeys = ["title", "url", "description"];
  const latestNews = response.data.articles.slice(-5);

  const filteredResponse = latestNews.map((news) =>
    Object.keys(news)
      .filter((key) => selectedKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = news[key];
        return obj;
      }, {})
  );

  return filteredResponse
    .map((res) => Object.values(res).join("\n"))
    .join("\n\n");
};

app.post("/", async (req, res) => {
  const chatId = req.body["message"]["chat"]["id"];
  const sentMessage = req.body.message.text;
  const userId = req.body.message.from.id;

  if (!db[userId]) {
    db[userId] = {
      saved_news: [],
    };
  }

  if (sentMessage.match(/start/gi)) {
    axios
      .post(`${process.env.URL}${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: Messages.start,
      })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else if (sentMessage.match(/latest_news/gi)) {
    const args = sentMessage.split(" ");
    axios
      .post(`${process.env.URL}${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: await getLatestNews(args.length === 2 && args[1]),
      })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else if (sentMessage.match(/save_news/gi)) {
    const url = sentMessage.split(" ")[1];
    let check = true;

    if (!url) {
      check = false;
    } else {
      db[userId]["saved_news"].push(url);
    }

    console.log(db);

    axios
      .post(`${process.env.URL}${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: check ? Messages.success_save : Messages.failed_save,
      })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else if (sentMessage.match(/saved_news/gi)) {
    let check = false;

    if (db[userId]["saved_news"].length > 0) {
      check = true;
    }

    axios
      .post(`${process.env.URL}${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: check
          ? [...db[userId]["saved_news"]].join("\n\n")
          : "No saved News",
      })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  } else {
    res.status(200).send({});
  }

  fs.writeFile("database.json", JSON.stringify(db), (error) => {
    if (error) {
      console.error(error);

      throw error;
    }
  });
});

module.exports = app;

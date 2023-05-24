const { default: axios } = require("axios");
const { Telegraf } = require("telegraf");
const Messages = require("../utils/messages");

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN, { polling: false });

// console.log(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(ctx.chat.id, Messages.start, {});
});

bot.command("latest_news", (ctx) => {
  axios
    .get("https://newsapi.org/v2/everything?q=keyword", {
      headers: {
        "X-Api-Key": process.env.NEWS_TOKEN,
      },
    })
    .then((response) => {
      const latestNews = response.data.articles.slice(-5);

      bot.telegram.sendMessage(ctx.chat.id, latestNews[0].title);
    });
});

module.exports = bot;

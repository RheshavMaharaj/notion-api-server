import express from 'express';
import path from 'path';
import Parser from 'rss-parser';

const widgetRoutes = express.Router();

widgetRoutes.route('/rss').get(async (req, res) => {
  const parser: Parser = new Parser();

  const feed = await parser.parseURL('https://www.autosport.com/rss/f1/news/');

  const cardContent = feed.items.map((data) => ({
    title: data.title,
    content: data.content,
    image: data.enclosure?.url,
    date: data.pubDate?.slice(0, 16),
  }));

  res.render(path.join(__dirname, '../views/pages/slider-card.ejs'), {
    title: feed.title,
    cards: cardContent,
  });
});


module.exports = widgetRoutes;

// (async () => {
//   const feed = await parser.parseURL('https://www.autosport.com/rss/f1/news/');
//   console.log(feed.items[0].enclosure);
// })();

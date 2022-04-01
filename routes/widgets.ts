import express from 'express';
import path from 'path';
import Parser from 'rss-parser';

const widgetRoutes = express.Router();

widgetRoutes.route('/rss').get(async (req, res) => {
  type CustomFeed = { foo: string };
  type CustomItem = { bar: number };

  const parser: Parser<CustomFeed, CustomItem> = new Parser();

  (async () => {
    const feed = await parser.parseURL('https://www.autosport.com/rss/f1/news/');
    console.log(feed.items[0].enclosure);
  })();

  res.render(path.join(__dirname, '../views/pages/rss-slideshow.ejs'));
});


module.exports = widgetRoutes;

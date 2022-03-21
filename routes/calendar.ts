import express from 'express';
import notion from '../modules/notion';

const calendarRoutes = express.Router();

declare let process: {
  env: {
    NOTION_CALENDAR_ID: string
  }
};

const databaseId = process.env.NOTION_CALENDAR_ID;

calendarRoutes.route('/calendar/new-event').post(async function(req, res) {
  const { title, date, notes, location } = req.body;

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Date: {
        type: 'date',
        date: {
          start: date.start,
          end: date.end,
        },
      },
      Notes: {
        type: 'rich_text',
        rich_text: [
          {
            text: {
              content: notes,
            },
          },
        ],
      },
      Location: {
        files: [
          {
            name: location.name,
            type: 'external',
            external: {
              url: location.url,
            },
          },
        ],
      },
    },
  });

  if (response.id) {
    res.json(response);
  }
  else {
    res.sendStatus(400);
  }
});

calendarRoutes.route('/calendar/delete-event').post(async function(req, res) {
  const queryResponse = await notion.databases.query({
    database_id: databaseId,
  });

  // @ts-expect-error
  const targetPage = queryResponse.results.find(page => page.properties.Name.title[0].text.content === req.body.name);

  if (targetPage) {
    const response = await notion.blocks.delete({
      block_id: targetPage.id,
    });
    res.json(response);
  }
  else {
    res.json({ message: 'invalid request' });
  }
});

module.exports = calendarRoutes;

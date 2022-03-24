import express from 'express';
import notion from '../modules/notion';

const calendarRoutes = express.Router();

declare let process: {
  env: {
    NOTION_CALENDAR_ID: string,
    HOME_LOCATION_URL: string,
  }
};

const databaseId = process.env.NOTION_CALENDAR_ID;

calendarRoutes.route('/calendar/create/event').post(async function(req, res) {
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
            name: location.name.length === 0 ? 'Home' : location.name,
            type: 'external',
            external: {
              url: location.url.length === 0 ? process.env.HOME_LOCATION_URL : location.url,
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

calendarRoutes.route('/calendar/create/all-day').post(async function(req, res) {
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
            name: location.name.length === 0 ? 'Home' : location.name,
            type: 'external',
            external: {
              url: location.url.length === 0 ? process.env.HOME_LOCATION_URL : location.url,
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

calendarRoutes.route('/calendar/update-event').post(async function(req, res) {
  const { title, date, notes, location } = req.body;

  const queryResponse = await notion.databases.query({
    database_id: databaseId,
  });

  const targetPage = queryResponse.results.find(page =>
    // @ts-expect-error
    page.properties.Name.title[0].text.content === req.body.query.name &&
    // @ts-expect-error
    page.properties.Date.date.start === req.body.query.date);

  if (targetPage) {
    const response = await notion.pages.update({
      page_id: targetPage.id,
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
              name: location.name.length === 0 ? 'Home' : location.name,
              type: 'external',
              external: {
                url: location.url.length === 0 ? process.env.HOME_LOCATION_URL : location.url,
              },
            },
          ],
        },
      },
    });
    res.json(response);
  }
  else {
    res.json({ message: 'invalid request' });
  }
});

calendarRoutes.route('/calendar/delete-event').post(async function(req, res) {
  const queryResponse = await notion.databases.query({
    database_id: databaseId,
  });

  const targetPage = queryResponse.results.find(page =>
    // @ts-expect-error
    page.properties.Name.title[0].text.content === req.body.name &&
    // @ts-expect-error
    page.properties.Date.date.start === req.body.date);

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

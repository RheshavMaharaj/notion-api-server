import express from 'express';
import notion from '../modules/notion';

const reminderRoutes = express.Router();

declare let process: {
  env: {
    NOTION_REMINDERS_DATABASE_ID: string,
  }
};

const databaseId = process.env.NOTION_REMINDERS_DATABASE_ID;

reminderRoutes.route('/reminders/create').get(async (req, res) => {
  const { title, date, priority, list, notes } = req.body;

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
      Priority: {
        type: 'select',
        select: {
          name: priority,
        },
      },
      List: {
        type: 'select',
        select: {
          name: list,
        },
      },
      'Custom Identifier': {
        rich_text: [
          {
            text: {
              content: notes,
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

reminderRoutes.route('/reminders/update').get(async (req, res) => {
  const { title, date, priority, list, notes } = req.body;

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
      Priority: {
        type: 'select',
        select: {
          name: priority,
        },
      },
      List: {
        type: 'select',
        select: {
          name: list,
        },
      },
      'Custom Identifier': {
        rich_text: [
          {
            text: {
              content: notes,
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

reminderRoutes.route('/reminders/delete').post(async (req, res) => {
  await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
    filter: {
      and: [
        {
          property: 'Custom Identifier',
          rich_text: {
            equals: req.body.notes,
          },
        },
      ],
    },
  }).then(async queryResponse => {
    await notion.blocks.delete({
      block_id: queryResponse.results[0].id,
    })
      .then(response => {
        res.json(response);
      });
  });
});

import notion from '../modules/notion';
import moment, { Moment } from 'moment';
import 'moment-timezone';

declare let process: {
  env: {
    NOTION_TASKS_DATABASE_ID: string,
    NOTION_STREAK_PAGE_ID: string,
    NOTION_AC_TASKS_DATABASE_ID: string,
  }
};

function createNewDate(date: Date): Moment {
  return moment(date).add(1, 'days').tz('Australia/Sydney');
}

export async function tasksJob() {
  if (moment().weekday() >= 6) return;
  const databaseId = process.env.NOTION_TASKS_DATABASE_ID;
  const today = moment().startOf('day');

  const queryResponse = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
    filter: {
      or: [
        {
          property: 'Date',
          date: {
            before: today.toISOString(),
          },
        },
      ],
    },
  });

  const relevantResults = queryResponse.results;

  for await (const result of relevantResults) {
    await notion.pages.update({
      page_id: result.id,
      properties: {
        Date: {
          date: {
            // @ts-expect-error
            start: createNewDate(result.properties.Date.date.start).toISOString(),
            // @ts-expect-error
            end: createNewDate(result.properties.Date.date.end).toISOString(),
          },
        },
      },
    });
  }
}

export async function archiveJob() {
  const databaseId = process.env.NOTION_AC_TASKS_DATABASE_ID;
  const queryResponse = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
    filter: {
      or: [
        {
          property: 'Status',
          select: {
            equals: 'Done',
          },
        },
      ],
    },
  });

  for await (const result of queryResponse.results) {
    await notion.pages.update({
      page_id: result.id,
      properties: {
        Status: {
          select: {
            name: 'Archive ⏳',
          },
        },
      },
    });
  }
};


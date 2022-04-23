import notion from '../modules/notion';
import fetch from 'node-fetch';
import { UpdatePageParameters } from '@notionhq/client/build/src/api-endpoints';

declare let process: {
  env: {
    NOTION_MUSIC_DATABASE_ID: string,
  }
};

const preventUpdate: Object[] = [];
const allUpdated: Object[] = [];

// const ratingOptions = [
//   '⭐️',
//   '⭐️⭐️',
//   '⭐️⭐️⭐️',
//   '⭐️⭐️⭐️⭐️',
//   '⭐️⭐️⭐️⭐️⭐️',
// ];

async function trackJob() {
  const databaseId = process.env.NOTION_MUSIC_DATABASE_ID;

  const queryResponse = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
    filter: {
      or: [
        {
          property: 'Title',
          rich_text: {
            contains: ';',
          },
        },
      ],
    },
  });

  const relevantResults = queryResponse.results.filter(
    (page) => !preventUpdate.includes(page.id),
  );

  for (const page of relevantResults) {
    // @ts-expect-error
    const query = page.properties.Title.title[0].plain_text;

    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}`)
      .then((resp) => resp.json());

    if (!(response.resultCount > 0)) {
      return;
    }

    const track = response.results[0];

    const updateOptions: UpdatePageParameters = {
      page_id: page.id,
      properties: {
        Title: {
          title: [
            {
              type: 'text',
              text: {
                content:
                  track.trackName ||
                  // @ts-expect-error
                  page.properties.Title.title[0].plain_text.replace(
                    ';',
                    '',
                  ),
              },
            },
          ],
        },
        Artist: {
          select: {
            name: track.artistName || 'Unknown',
          },
        },
        Genre: {
          select: {
            name: track.primaryGenreName || 'Unknown',
          },
        },
        Album: {
          select: {
            name: track.collectionName || 'Unknown',
          },
        },
        Link: {
          url: track.trackViewUrl,
        },
      },
      icon: {
        emoji: '🎻',
      },
    };

    if (track.artworkUrl100) {
      updateOptions.icon = {
        external: {
          url: track.artworkUrl100,
        },
      };
      updateOptions.cover = {
        external: {
          url: track.artworkUrl100,
        },
      };
    }

    try {
      await notion.pages.update(updateOptions);
      // @ts-expect-error
      allUpdated.push(page.properties.Title.title[0].plain_text);
    }
    catch (error: any) {
      if (error.status === 409) {
        setTimeout(async () => {
          try {
            await notion.pages.update(updateOptions);
          }
          catch (updateError: any) {
            preventUpdate.push(page.id);
          }
        }, 3000);
      }
      else {
        preventUpdate.push(page.id);
      }
    }
  }
};

export default trackJob;

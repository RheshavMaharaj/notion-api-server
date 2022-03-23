// Based on notion-reading-list application by shaunakg
import notion from '../modules/notion';
import fetch from 'node-fetch';
import { UpdatePageParameters } from '@notionhq/client/build/src/api-endpoints';

declare let process: {
  env: {
    NOTION_READING_DATABASE_ID: string,
  }
};

const preventUpdate: Object[] = [];
const allUpdated: Object[] = [];

const ratingOptions = [
  '⭐️',
  '⭐️⭐️',
  '⭐️⭐️⭐️',
  '⭐️⭐️⭐️⭐️',
  '⭐️⭐️⭐️⭐️⭐️',
];

async function bookJob() {
  const databaseId = process.env.NOTION_READING_DATABASE_ID;

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

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
      .then((resp) => resp.json());

    if (!(response.totalItems > 0)) {
      return;
    }

    const book = response.items[0];

    const updateOptions: UpdatePageParameters = {
      page_id: page.id,
      properties: {
        Title: {
          title: [
            {
              type: 'text',
              text: {
                content:
                  book.volumeInfo.title ||
                  // @ts-expect-error
                  page.properties.Title.title[0].plain_text.replace(
                    ';',
                    '',
                  ),
              },
            },
          ],
        },
        Author: {
          multi_select: book.volumeInfo.authors
            .filter((author: any) => author)
            .map((author: string) => ({
              name: author.replace(',', ''),
            })),
        },
        Genre: {
          multi_select: (book.volumeInfo.categories || [])
            .filter((category: any) => category)
            .map((category: string) => ({
              name: category.replace(',', ''),
            })),
        },
        Link: {
          url: book.volumeInfo.previewLink,
        },
        Publisher: {
          select: {
            name: book.volumeInfo.publisher || 'Unknown',
          },
        },
        Summary: {
          rich_text: [
            {
              text: {
                content:
                  (book.volumeInfo.description || '').length <
                    500
                    ? book.volumeInfo.description || ''
                    : book.volumeInfo.description.substring(
                      0,
                      500,
                    ) + '...',
              },
            },
          ],
        },
        Type: {
          select: {
            name: 'Book',
          },
        },
      },
      icon: {
        emoji: '📖',
      },
    };

    if (book.volumeInfo.imageLinks) {
      updateOptions.icon = {
        external: {
          url: book.volumeInfo.imageLinks.thumbnail,
        },
      };
      updateOptions.cover = {
        external: {
          url: book.volumeInfo.imageLinks.thumbnail,
        },
      };
    }
    if (book.volumeInfo.averageRating) {
      const visualRating = Math.floor(book.volumeInfo.averageRating);
      // @ts-expect-error
      updateOptions.properties.Rating = {
        select: {
          name: ratingOptions[visualRating - 1],
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

export default bookJob;

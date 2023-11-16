import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchHackerNewsData, filterAndSortEntries } from '../../src/app';

const mock = new MockAdapter(axios);
const mockedHtml = `
  <html>
    <body>
      <table class="itemlist">
        ${Array.from({ length: 30 }, (_, i) => `
          <tr class="athing" id="${i + 1}">
            <td align="right" valign="top" class="title">
              <span class="rank">${i + 1}.</span>
            </td>
            <td class="title">
              <a href="https://example.com/story/${i}" class="storylink">Test Title ${i + 1}</a>
            </td>
          </tr>
          <tr>
            <td colspan="2"></td>
            <td class="subtext">
              <span class="score" id="score_${i}">${(i + 1) * 10} points</span>
              by <a href="#" class="hnuser">user${i}</a>
              <a href="#">hide</a> |
              <a href="#">past</a> |
              <a href="https://example.com/story/${i}">${(i + 1) * 3} comments</a>
            </td>
          </tr>
        `).join('')}
      </table>
    </body>
  </html>
`;

describe('Hacker News Data Fetching', () => {
  it('fetches data successfully', async () => {
    mock.onGet('https://news.ycombinator.com/').reply(200, mockedHtml);

    const data = await fetchHackerNewsData();
    expect(data).toHaveLength(30); // Expect 30 items
  });

  it('handles network errors', async () => {
    mock.onGet('https://news.ycombinator.com/').networkError();

    await expect(fetchHackerNewsData()).rejects.toThrow('Network Error');
  });
});

describe('Data Filtering and Sorting', () => {
  const mockData = [
    {
      title: 'Less than five',
      order: 1,
      points: 120,
      comments: 30
    },
    {
      title: 'Second less than five',
      order: 2,
      points: 150,
      comments: 45
    },
    {
      title: 'This is a longer title with more than five words',
      order: 3,
      points: 200,
      comments: 60
    },
    {
      title: 'Another short',
      order: 4,
      points: 90,
      comments: 20
    },
    {
      title: 'Another long title example for testing',
      order: 5,
      points: 180,
      comments: 50
    },
    {
      title: 'Shortest',
      order: 6,
      points: 75,
      comments: 15
    },
    {
      title: 'A very long title that exceeds the five word length',
      order: 7,
      points: 210,
      comments: 70
    },
  ];

  it('filters entries with more than five words', () => {
    const { moreThanFiveWords } = filterAndSortEntries(mockData);
    expect(moreThanFiveWords.length).toBe(3)
    expect(moreThanFiveWords[0].title).toBe('A very long title that exceeds the five word length')
  });

  it('filters entries with five or fewer words', () => {
    const { fiveWordsOrLess } = filterAndSortEntries(mockData);
    expect(fiveWordsOrLess.length).toBe(4)
    expect(fiveWordsOrLess[0].title).toBe('Second less than five')
  });
});

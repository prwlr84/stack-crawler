import axios from 'axios';
import cheerio from 'cheerio';

interface Entry {
    title: string;
    order: number;
    points: number;
    comments: number;
}

export async function fetchHackerNewsData(): Promise<Entry[]> {
    try {
        const response = await axios.get('https://news.ycombinator.com/');
        const html = response.data;
        const $ = cheerio.load(html);
        const entries: Entry[] = [];

        $('.athing').each((index, element) => {
            if (index < 30) { // Limit to first 30 entries
                const title = $(element).find('.title a').text().trim();
                const order = parseInt($(element).find('.rank').text().trim().replace('.', ''), 10);
                const subtext = $(element).next().find('.subtext');
                const points = parseInt(subtext.find('.score').text().trim().split(' ')[0], 10);
                const commentsText = subtext.find('a').last().text().trim();
                const comments = commentsText.includes('comments') ? parseInt(commentsText.split('\xa0')[0], 10) : 0;

                entries.push({ title, order, points, comments });
            }
        });

        return entries;
    } catch (error) {
        throw new Error(`Network Error: ${error.message}`);
    }
}

export function filterAndSortEntries(entries: Entry[]): { moreThanFiveWords: Entry[], fiveWordsOrLess: Entry[] } {
    const moreThanFiveWords = entries
      .filter(entry => entry.title.split(' ').length > 5)
      .sort((a, b) => b.comments - a.comments);

    const fiveWordsOrLess = entries
      .filter(entry => entry.title.split(' ').length <= 5)
      .sort((a, b) => b.points - a.points);

    return { moreThanFiveWords, fiveWordsOrLess };
}

async function main() {
    const entries = await fetchHackerNewsData();
    const filteredEntries = filterAndSortEntries(entries);
    console.log('Entries with more than five words in the title:', filteredEntries.moreThanFiveWords);
    console.log('Entries with five words or less in the title:', filteredEntries.fiveWordsOrLess);
}

main();

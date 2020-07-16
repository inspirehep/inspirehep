const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { getMetaDescription } = require('../../utils/dom');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Author Detail', () => {
  let polly;

  beforeEach(async () => {
    polly = await createPollyInstance('AuthorDetail');

    await page.goto(routes.public.authorDetail1274753, {
      waitUntil: 'networkidle0',
    });
  });

  it('should match image snapshot for an Author', async () => {
    await page.waitFor(selectors.searchResults);

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });

  it('sets author name as document title', async () => {
    const documentTitle = await page.title();

    expect(documentTitle).toMatch(/^Grit Hotzel/);
  });

  it('sets "author brief" as meta description', async () => {
    const metaDescription = await getMetaDescription(page);
    expect(metaDescription).toMatchSnapshot();
  });

  afterEach(async () => {
    await polly.stop();
  });
});

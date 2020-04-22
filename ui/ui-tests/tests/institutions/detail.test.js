const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { getMetaDescription } = require('../../utils/dom');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Institution Detail', () => {
  let polly;

  beforeEach(async () => {
    polly = await createPollyInstance('InstitutionDetail');
    await page.goto(routes.public.institutionsDetail902624, {
      waitUntil: 'networkidle0',
    });
  });

  xit('should match image snapshot for an Institution', async () => {
    await page.waitFor(selectors.searchResults);

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });

  xit('sets institution name as document title', async () => {
    const documentTitle = await page.title();

    expect(documentTitle).toMatch(/^Aachen, Tech. Hochsch./);
  });

  xit('sets correct description as meta description', async () => {
    const metaDescription = await getMetaDescription(page);
    expect(metaDescription).toMatchSnapshot();
  });

  afterEach(async () => {
    await polly.stop();
  });
});

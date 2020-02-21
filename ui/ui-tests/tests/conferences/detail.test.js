const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { getMetaDescription } = require('../../utils/dom');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Conference Detail', () => {
  let polly;

  beforeEach(async () => {
    polly = await createPollyInstance('ConferenceDetail');

    await page.goto(routes.public.conferenceDetail1339293, {
      waitUntil: 'networkidle0',
    });
  });

  it('should match image snapshot for a Conference', async () => {
    await page.waitFor(selectors.searchResults);

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });

  it('sets conference name as document title', async () => {
    const documentTitle = await page.title();

    expect(documentTitle).toMatch(
      /^4th International Conference on Micro Pattern Gaseous Detectors/
    );
  });

  it('sets conference short description as meta description', async () => {
    const metaDescription = await getMetaDescription(page);
    expect(metaDescription).toMatchSnapshot();
  });

  afterEach(async () => {
    await polly.stop();
  });
});

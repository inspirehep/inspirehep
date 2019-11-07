const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Conference Detail', () => {
  let polly;

  beforeAll(async () => {
    await login();
  });

  beforeEach(async () => {
    await page.setRequestInterception(true);
    polly = createPollyInstance('ConferenceDetail');

    await page.goto(routes.public.conferenceDetail1203206, {
      waitUntil: 'networkidle0',
    });
  });

  xit('should match image snapshot for a Conference', async () => {
    await page.waitFor(selectors.searchResults);

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });

  xit('sets conference name as document title', async () => {
    const documentTitle = await page.title();

    expect(documentTitle).toMatch(
      /^37th International Conference on High Energy Physics/
    );
  });

  afterEach(async () => {
    await polly.stop();
  });

  afterAll(async () => {
    await logout();
  });
});

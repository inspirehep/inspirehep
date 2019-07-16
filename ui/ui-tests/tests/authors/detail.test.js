const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Author Detail', () => {
  beforeAll(async () => {
    await login();
  });

  it('should match image snapshot for an Author', async () => {
    await page.setRequestInterception(true);
    const polly = createPollyInstance('AuthorDetail');

    await page.goto(routes.public.authorDetail983328, {
      waitUntil: 'networkidle0',
    });
    await page.waitFor(selectors.searchResults);

    const desktopSS = await takeScreenShotForDesktop(page);
    // FIXME: citations by year graph is rendered incorrectly sometimes, therefore `failureThreshold`
    expect(desktopSS).toMatchImageSnapshot({
      failureThreshold: '0.071',
      failureThresholdType: 'percent',
    });

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();

    await polly.stop();
  });

  afterAll(async () => {
    await logout();
  });
});

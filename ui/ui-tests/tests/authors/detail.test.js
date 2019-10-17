const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Author Detail', () => {
  let polly;

  beforeAll(async () => {
    await login();
  });

  beforeEach(async () => {
    await page.setRequestInterception(true);
    polly = createPollyInstance('AuthorDetail');

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

  afterEach(async () => {
    await polly.stop();
  });

  afterAll(async () => {
    await logout();
  });
});

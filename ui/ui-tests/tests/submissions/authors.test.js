const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');

describe('Author Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for author submission form', async () => {
    await page.goto(routes.private.authorSubmission, {
      waitUntil: 'networkidle0',
    });

    await page.setViewport({ width: 1280, height: 1400 });
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
  });

  xit('matches screenshot for author update submission form', async () => {
    await page.setRequestInterception(true);

    const polly = createPollyInstance('AuthorUpdateSubmission');

    await page.goto(routes.private.author1073117UpdateSubmission, {
      waitUntil: 'networkidle0',
    });

    await page.setViewport({ width: 1280, height: 1400 });
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });

  afterAll(async () => {
    await logout();
  });
});

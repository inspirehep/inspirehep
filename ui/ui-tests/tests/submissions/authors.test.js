const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');
const { takeScreenShotForDesktop } = require('../../utils/screenshot');

describe('Author Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for author submission form', async () => {
    await page.goto(routes.private.authorSubmission, {
      waitUntil: 'networkidle0',
    });

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();
  });

  it('matches screenshot for author update submission form', async () => {
    await page.setRequestInterception(true);

    const polly = createPollyInstance('AuthorUpdateSubmission');

    await page.goto(routes.private.author1073117UpdateSubmission, {
      waitUntil: 'networkidle0',
    });

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });

  afterAll(async () => {
    await logout();
  });
});

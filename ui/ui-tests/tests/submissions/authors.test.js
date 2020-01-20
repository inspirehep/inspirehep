const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');
const { takeScreenShotForDesktop } = require('../../utils/screenshot');

describe('Author Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for author submission form', async () => {
    const polly = await createPollyInstance('AuthorSubmission');

    await page.goto(routes.private.authorSubmission, {
      waitUntil: 'networkidle0',
    });

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });

  it('matches screenshot for author update submission form', async () => {
    const polly = await createPollyInstance('AuthorUpdateSubmission');

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

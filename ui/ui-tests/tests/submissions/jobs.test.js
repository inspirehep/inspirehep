const { routes } = require('../../utils/constants');
const { login, logout } = require('../../utils/user');
const { takeScreenShotForDesktop } = require('../../utils/screenshot');

describe('Jobs Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for author submission form', async () => {
    await page.goto(routes.private.jobSubmission, {
      waitUntil: 'networkidle0',
    });

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();
  });

  afterAll(async () => {
    await logout();
  });
});

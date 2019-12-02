const { routes } = require('../../utils/constants');
const { login, logout } = require('../../utils/user');
const { takeScreenShotForDesktop } = require('../../utils/screenshot');

describe('Conferences Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for conference submission form', async () => {
    await page.goto(routes.private.conferenceSubmission, {
      waitUntil: 'networkidle0',
    });

    const image = await takeScreenShotForDesktop(page);
    expect(image).toMatchImageSnapshot();
  });

  afterAll(async () => {
    await logout();
  });
});

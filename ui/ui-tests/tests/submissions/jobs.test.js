const { routes } = require('../../utils/constants');
const { login, logout } = require('../../utils/user');

describe('Jobs Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for author submission form', async () => {
    await page.goto(routes.private.jobSubmission, {
      waitUntil: 'networkidle0',
    });

    await page.setViewport({ width: 1280, height: 1400 });
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
  });

  afterAll(async () => {
    await logout();
  });
});

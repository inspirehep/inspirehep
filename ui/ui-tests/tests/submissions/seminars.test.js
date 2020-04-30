const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { login, logout } = require('../../utils/user');
const { takeScreenShotForDesktop } = require('../../utils/screenshot');

describe('Seminar Submission', () => {
  beforeAll(async () => {
    await login();
  });

  it('matches screenshot for seminar submission form', async () => {
    const polly = await createPollyInstance('SeminarSubmission');

    await page.goto(routes.private.seminarSubmission, {
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

const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { mockPageDateForNextNavigation } = require('../../utils/date');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Job Detail', () => {
  beforeEach(async () => {
    await mockPageDateForNextNavigation(page, '2019-07-07');
  });

  it('should match image snapshot for a Job', async () => {
    await page.setRequestInterception(true);
    const polly = createPollyInstance('JobDetail');

    await page.goto(routes.public.jobDetail1727456, {
      waitUntil: 'networkidle0',
    });

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();

    await polly.stop();
  });
});

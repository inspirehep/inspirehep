const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { mockPageDateForNextNavigation } = require('../../utils/date');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Job Search', () => {
  beforeEach(async () => {
    await mockPageDateForNextNavigation(page, '2019-07-07');
  });

  it('should match image snapshot for empty Job search', async () => {
    await page.setRequestInterception(true);
    const polly = createPollyInstance('JobSearch');

    await page.goto(`${routes.public.jobsSearch}?q=`, {
      waitUntil: 'networkidle0',
    });
    await page.waitFor(selectors.searchResults);

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();

    await polly.stop();
  });
});

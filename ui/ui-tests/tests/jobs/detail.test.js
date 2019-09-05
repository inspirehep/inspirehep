const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { mockPageDateForNextNavigation } = require('../../utils/date');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Job Detail', () => {
  let polly;

  beforeEach(async () => {
    await mockPageDateForNextNavigation(page, '2019-07-07');

    await page.setRequestInterception(true); // TODO: move to createPollyInstance
    polly = createPollyInstance('JobDetail'); // TODO: rename to `Recorder`

    await page.goto(routes.public.jobDetail1727456, {
      waitUntil: 'networkidle0',
    });
  });

  it('should match image snapshot for a Job', async () => {
    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });

  it('sets job position as document title', async () => {
    const documentTitle = await page.title();

    expect(documentTitle).toMatch(/^Director-General/);
  });

  afterEach(async () => {
    await polly.stop();
  });
});

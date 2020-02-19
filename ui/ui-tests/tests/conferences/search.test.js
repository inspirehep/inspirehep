const { routes, selectors } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Conference Search', () => {
  it('should match image snapshot for empty conference search', async () => {
    const polly = await createPollyInstance('ConferenceSearch');

    await page.goto(`${routes.public.conferenceSearch}?q=`, {
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

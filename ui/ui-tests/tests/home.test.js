const { routes } = require('../utils/constants');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../utils/screenshot');

describe('Home', () => {
  it('should match image snapshot', async () => {
    await page.goto(routes.public.home);

    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });
});

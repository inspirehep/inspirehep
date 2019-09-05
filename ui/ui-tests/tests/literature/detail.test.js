const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Literature Detail', () => {
  let polly;

  beforeEach(async () => {
    await page.setRequestInterception(true);
    polly = createPollyInstance('LiteratureDetail');

    await page.goto(routes.public.literatureDetail1472986, {
      waitUntil: 'networkidle0',
    });
  });

  it('should match image snapshot for a literature', async () => {
    const desktopSS = await takeScreenShotForDesktop(page);
    expect(desktopSS).toMatchImageSnapshot();

    const mobileSS = await takeScreenShotForMobile(page);
    expect(mobileSS).toMatchImageSnapshot();
  });

  it('sets literature title as document title', async () => {
    const documentTitle = await page.title();

    expect(documentTitle).toMatch(/^Estimating/);
  });


  afterEach(async () => {
    await polly.stop();
  });
});

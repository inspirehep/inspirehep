const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');
const { getMetaDescription } = require('../../utils/dom');
const {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
} = require('../../utils/screenshot');

describe('Literature Detail', () => {
  let polly;

  beforeEach(async () => {
    polly = await createPollyInstance('LiteratureDetail');

    await page.goto(routes.public.literatureDetail1517533, {
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

    expect(documentTitle).toMatch(/^Fermionic/);
  });

  it('sets abstract as meta description', async () => {
    const metaDescription = await getMetaDescription(page);
    expect(metaDescription).toMatchSnapshot();
  });

  afterEach(async () => {
    await polly.stop();
  });
});

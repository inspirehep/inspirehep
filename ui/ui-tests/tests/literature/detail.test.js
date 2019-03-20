const { routes } = require('../../utils/constants');
const { createPollyInstance } = require('../../utils/polly');

describe('Literature Detail', () => {
  it('should match image snapshot for a literature', async () => {
    await page.setRequestInterception(true);
    const polly = createPollyInstance('LiteratureDetail');

    await page.goto(routes.private.literatureDetail1472986, {
      waitUntil: 'networkidle0',
    });
    await page.setViewport({ width: 1280, height: 1400 });
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();

    await polly.stop();
  });
});

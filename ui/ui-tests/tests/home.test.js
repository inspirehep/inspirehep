const { routes } = require('../utils/constants');

describe('Home', () => {
  it('should match image snapshot', async () => {
    await page.goto(routes.public.home);
    await page.setViewport({ width: 1280, height: 1400 });
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
  });
});

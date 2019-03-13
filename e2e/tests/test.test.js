describe('test', () => {
  it('passes', () => {
    expect(true).toBeTruthy();
  });

  it('matches homepage screenshot', async () => {
    await page.goto('http://ui:8081');
    await page.setViewport({ width: 1280, height: 1400 });
    const image = await page.screenshot({ fullPage: true });
    expect(image).toMatchImageSnapshot();
  });
});

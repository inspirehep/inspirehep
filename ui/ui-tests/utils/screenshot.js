async function fastForwardAnimations(page) {
  // https://github.com/GoogleChrome/puppeteer/issues/453
  await page._client.send('Animation.setPlaybackRate', { playbackRate: 24 });
}

async function takeScreenShotForDesktop(page) {
  await fastForwardAnimations(page);
  await page.setViewport({ width: 1366, height: 768 });

  return page.screenshot({ fullPage: true });
}

async function takeScreenShotForMobile(page) {
  await fastForwardAnimations(page);
  await page.setViewport({ width: 375, height: 667, isMobile: true });

  return page.screenshot({ fullPage: true });
}

module.exports = {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
};

const { selectors } = require('./constants');

async function fastForwardAnimations(page) {
  // https://github.com/GoogleChrome/puppeteer/issues/453
  await page._client.send('Animation.setPlaybackRate', { playbackRate: 24 });
}

async function disableBlinkingInputCursor(page) {
  const content = `
    * {
      caret-color: transparent !important;
    }
  `;
  await page.addStyleTag({ content });
}

async function waitForLoadingIndicatorsToDisappear(page) {
  await page.waitFor(
    loadingIndicatorSelector =>
      !document.querySelector(loadingIndicatorSelector),
    {},
    selectors.loadingIndicator
  );
}

async function takeScreenShotForDesktop(page) {
  await fastForwardAnimations(page);
  await page.setViewport({ width: 1366, height: 768 });

  await disableBlinkingInputCursor(page);
  await waitForLoadingIndicatorsToDisappear(page);
  return page.screenshot({ fullPage: true });
}

async function takeScreenShotForMobile(page) {
  await fastForwardAnimations(page);
  await page.setViewport({ width: 375, height: 667, isMobile: true });

  await disableBlinkingInputCursor(page);
  await waitForLoadingIndicatorsToDisappear(page);
  return page.screenshot({ fullPage: true });
}

module.exports = {
  takeScreenShotForDesktop,
  takeScreenShotForMobile,
};

export const BROWSERS = {
  Safari: 'Apple Safari',
  Chrome: 'Google Chrome or Chromium',
  Edge: 'Microsoft Edge',
  IE: 'Microsoft Internet Explorer',
  Opera: 'Opera',
  Firefox: 'Mozilla Firefox',
  Unknown: 'Unknown',
};

class Browser {
  isSafari() {
    return this.getBrowserName() === BROWSERS.Safari;
  }

  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
  // use a library (npmjs.com/package/bowser) if more info from userAgent is needed (like OS, version etc.)
  // eslint-disable-next-line class-methods-use-this
  getBrowserName() {
    const { userAgent } = navigator;
    if (userAgent.indexOf('Firefox') > -1) {
      return BROWSERS.Firefox;
    }
    if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      return BROWSERS.Opera;
    }
    if (userAgent.indexOf('Trident') > -1) {
      return BROWSERS.IE;
    }
    if (userAgent.indexOf('Edge') > -1) {
      return BROWSERS.Edge;
    }
    if (userAgent.indexOf('Chrome') > -1) {
      return BROWSERS.Chrome;
    }
    if (userAgent.indexOf('Safari') > -1) {
      return BROWSERS.Safari;
    }

    return BROWSERS.Unknown;
  }
}

export const browser = new Browser();

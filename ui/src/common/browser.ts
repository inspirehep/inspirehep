type BrowserName =
  | 'Firefox'
  | 'Opera'
  | 'IE'
  | 'Chrome'
  | 'Edge'
  | 'Safari'
  | undefined;

class CurrentBrowser {
  isSafari() {
    return this.getName() === 'Safari';
  }

  // adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
  // use a library (npmjs.com/package/bowser) if more info from userAgent is needed (like OS, version etc.)
  // eslint-disable-next-line class-methods-use-this
  getName(): BrowserName {
    const { userAgent } = navigator;
    if (userAgent.indexOf('Firefox') > -1) {
      return 'Firefox';
    }
    if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      return 'Opera';
    }
    if (userAgent.indexOf('Trident') > -1) {
      return 'IE';
    }
    if (userAgent.indexOf('Edge') > -1) {
      return 'Edge';
    }
    if (userAgent.indexOf('Chrome') > -1) {
      return 'Chrome';
    }
    if (userAgent.indexOf('Safari') > -1) {
      return 'Safari';
    }
  }
}

export const browser = new CurrentBrowser();

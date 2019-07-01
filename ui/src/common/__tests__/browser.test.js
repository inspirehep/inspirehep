import { browser, BROWSERS } from '../browser';

describe('browser', () => {
  const userAgentGetter = jest.spyOn(navigator, 'userAgent', 'get');

  describe('getBrowserName', () => {
    it('returns "Apple Safari" for Safari', () => {
      userAgentGetter.mockReturnValueOnce(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306'
      );

      const result = browser.getBrowserName();
      expect(result).toEqual(BROWSERS.Safari);
    });

    it('returns "Google Chrome or Chromium" for Chrome ', () => {
      userAgentGetter.mockReturnValueOnce(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
      );
      const result = browser.getBrowserName();
      expect(result).toEqual(BROWSERS.Chrome);
    });

    it('returns "Unknown" for "WHATEVER"', () => {
      userAgentGetter.mockReturnValueOnce('WHATEVER');
      const result = browser.getBrowserName();
      expect(result).toEqual(BROWSERS.Unknown);
    });
  });

  describe('isSafari', () => {
    it('returns true for Safari', () => {
      userAgentGetter.mockReturnValueOnce(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306'
      );
      const result = browser.isSafari();
      expect(result).toBe(true);
    });

    it('returns false for Firefox', () => {
      userAgentGetter.mockReturnValueOnce(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:66.0) Gecko/20100101 Firefox/66.0'
      );
      const result = browser.isSafari();
      expect(result).toBe(false);
    });
  });
});

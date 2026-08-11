import { sanitizeUrl } from '../sanitizeUrl';

describe('sanitizeUrl', () => {
  it('returns "#" for an empty string', () => {
    expect(sanitizeUrl('')).toBe('#');
  });

  it('returns "#" for a string that is not a valid URL and no base is given', () => {
    expect(sanitizeUrl('not a url')).toBe('#');
  });

  it('returns the href for a valid http URL', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('returns the href for a valid https URL', () => {
    expect(sanitizeUrl('https://example.com/path?x=1#frag')).toBe(
      'https://example.com/path?x=1#frag'
    );
  });

  it('returns the href for a valid mailto URL', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe(
      'mailto:test@example.com'
    );
  });

  it('returns the href for a valid tel URL', () => {
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com/');
  });

  it('resolves a relative URL against the given base when the base protocol is safe', () => {
    expect(sanitizeUrl('/path', 'https://example.com')).toBe(
      'https://example.com/path'
    );
  });

  it('returns "#" for a javascript: URL', () => {
    // eslint-disable-next-line no-script-url
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
  });

  it('returns "#" for a javascript: URL regardless of casing', () => {
    // eslint-disable-next-line no-script-url
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('#');
  });

  it('returns "#" for a data: URL', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
  });

  it('returns "#" for a file: URL', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
  });

  it('returns "#" for an unsupported protocol such as ftp:', () => {
    expect(sanitizeUrl('ftp://example.com')).toBe('#');
  });
});

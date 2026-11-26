import MockAdapter from 'axios-mock-adapter';

import http from '../../../common/http';
import { getStore } from '../../../fixtures/store';
import { extractAuthors } from '../../editor/authors';
import {
  notifyAuthorsExtractionError,
  notifyAuthorsExtractionSuccess,
  notifyAuthorsExtractionWarning,
} from '../../../editor/notifications';

const mockHttp = new MockAdapter((http as any).httpClient);

vi.mock('../../../editor/notifications', () => ({
  notifyAuthorsExtractionSuccess: vi.fn(),
  notifyAuthorsExtractionWarning: vi.fn(),
  notifyAuthorsExtractionError: vi.fn(),
}));

afterEach(() => {
  mockHttp.reset();
  vi.clearAllMocks();
});

describe('extractAuthors', () => {
  const authors = [{ full_name: 'Doe, John' }, { full_name: 'Roe, Jane' }];
  const xml = '<collaborationauthorlist><a/></collaborationauthorlist>';

  it('posts text to authorlist/text and returns the authors', async () => {
    mockHttp
      .onPost('/editor/authorlist/text', { text: 'Doe, John' })
      .replyOnce(200, { authors });

    const result = await getStore().dispatch<any>(extractAuthors('Doe, John'));

    expect(result).toEqual(authors);
    expect(notifyAuthorsExtractionSuccess).toHaveBeenCalledWith(2);
    expect(notifyAuthorsExtractionWarning).not.toHaveBeenCalled();
  });

  it('posts urls to authorlist/url', async () => {
    const url = 'https://example.org/authors';
    mockHttp
      .onPost('/editor/authorlist/url', { url })
      .replyOnce(200, { authors });

    const result = await getStore().dispatch<any>(extractAuthors(url));

    expect(result).toEqual(authors);
  });

  it('posts collaborationauthorlist xml to authorlist/xml', async () => {
    mockHttp
      .onPost('/editor/authorlist/xml', { xml })
      .replyOnce(200, { authors });

    const result = await getStore().dispatch<any>(extractAuthors(xml));

    expect(result).toEqual(authors);
  });

  it.each([
    ['other xml', '<foo>bar</foo>'],
    ['very long text starting with http', `http${'a'.repeat(2048)}`],
  ])('posts %s to authorlist/text', async (_name, text) => {
    mockHttp
      .onPost('/editor/authorlist/text', { text })
      .replyOnce(200, { authors });

    const result = await getStore().dispatch<any>(extractAuthors(text));

    expect(result).toEqual(authors);
  });

  it('notifies each warning returned by the api', async () => {
    mockHttp
      .onPost('/editor/authorlist/text')
      .replyOnce(200, { authors, warnings: ['w1', 'w2'] });

    await getStore().dispatch<any>(extractAuthors('text'));

    expect(notifyAuthorsExtractionWarning).toHaveBeenCalledTimes(2);
    expect(notifyAuthorsExtractionWarning).toHaveBeenCalledWith('w1');
    expect(notifyAuthorsExtractionWarning).toHaveBeenCalledWith('w2');
  });

  it('notifies the server message on 400 and returns undefined', async () => {
    mockHttp
      .onPost('/editor/authorlist/text')
      .replyOnce(400, { message: 'Bad input' });

    const result = await getStore().dispatch<any>(extractAuthors('text'));

    expect(result).toBeUndefined();
    expect(notifyAuthorsExtractionError).toHaveBeenCalledWith('Bad input');
    expect(notifyAuthorsExtractionSuccess).not.toHaveBeenCalled();
  });

  it('notifies a generic error on other failures', async () => {
    mockHttp.onPost('/editor/authorlist/text').replyOnce(500);

    const result = await getStore().dispatch<any>(extractAuthors('text'));

    expect(result).toBeUndefined();
    expect(notifyAuthorsExtractionError).toHaveBeenCalledWith(undefined);
  });
});

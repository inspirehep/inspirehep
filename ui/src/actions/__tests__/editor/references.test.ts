import MockAdapter from 'axios-mock-adapter';

import http from '../../../common/http';
import { getStore } from '../../../fixtures/store';
import { extractReferences, linkReferences } from '../../editor/references';
import {
  notifyReferencesExtractionError,
  notifyReferencesExtractionSuccess,
  notifyReferencesLinkingError,
  notifyReferencesLinkingSuccess,
} from '../../../editor/notifications';

const mockHttp = new MockAdapter((http as any).httpClient);

vi.mock('../../../editor/notifications', () => ({
  notifyReferencesExtractionSuccess: vi.fn(),
  notifyReferencesExtractionError: vi.fn(),
  notifyReferencesLinkingSuccess: vi.fn(),
  notifyReferencesLinkingError: vi.fn(),
}));

afterEach(() => {
  mockHttp.reset();
  vi.clearAllMocks();
});

describe('extractReferences', () => {
  const references = [{ reference: { label: '1' } }, { reference: {} }];

  it('posts text to refextract/text and returns the references', async () => {
    mockHttp
      .onPost('/editor/refextract/text', { text: '[1] Some reference' })
      .replyOnce(200, references);
    const store = getStore();

    const result = await store.dispatch<any>(
      extractReferences('[1] Some reference')
    );

    expect(result).toEqual(references);
    expect(notifyReferencesExtractionSuccess).toHaveBeenCalledWith(2);
  });

  it.each(['http://arxiv.org/pdf/1', 'https://arxiv.org/pdf/1'])(
    'posts the url %s to refextract/url',
    async (url) => {
      mockHttp
        .onPost('/editor/refextract/url', { url })
        .replyOnce(200, references);
      const store = getStore();

      const result = await store.dispatch<any>(extractReferences(url));

      expect(result).toEqual(references);
      expect(notifyReferencesExtractionSuccess).toHaveBeenCalledWith(2);
    }
  );

  it.each([
    ['plain text', '[1] Some reference'],
    ['very long text starting with http', `http${'a'.repeat(2048)}`],
  ])('posts %s to refextract/text', async (_name, text) => {
    mockHttp
      .onPost('/editor/refextract/text', { text })
      .replyOnce(200, references);
    const store = getStore();

    const result = await store.dispatch<any>(extractReferences(text));

    expect(result).toEqual(references);
    expect(notifyReferencesExtractionSuccess).toHaveBeenCalledWith(2);
  });

  it('notifies and returns undefined on error', async () => {
    mockHttp.onPost('/editor/refextract/text').replyOnce(500);
    const store = getStore();

    const result = await store.dispatch<any>(extractReferences('text'));

    expect(result).toBeUndefined();
    expect(notifyReferencesExtractionError).toHaveBeenCalled();
    expect(notifyReferencesExtractionSuccess).not.toHaveBeenCalled();
  });
});

describe('linkReferences', () => {
  const references = [{ reference: { label: '1' } }];
  const linked = [{ reference: { label: '1' }, record: { $ref: 'x' } }];

  it('posts references to the matcher and returns the linked ones', async () => {
    mockHttp
      .onPost('/matcher/linked_references', { references })
      .replyOnce(200, { references: linked });
    const store = getStore();

    const result = await store.dispatch<any>(linkReferences(references));

    expect(result).toEqual(linked);
    expect(notifyReferencesLinkingSuccess).toHaveBeenCalled();
  });

  it('notifies and returns undefined on error', async () => {
    mockHttp.onPost('/matcher/linked_references').replyOnce(500);
    const store = getStore();

    const result = await store.dispatch<any>(linkReferences(references));

    expect(result).toBeUndefined();
    expect(notifyReferencesLinkingError).toHaveBeenCalled();
    expect(notifyReferencesLinkingSuccess).not.toHaveBeenCalled();
  });
});

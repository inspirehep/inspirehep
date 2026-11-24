import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import { Author, AuthorsExtractionResult } from '../../editor/types';
import {
  notifyAuthorsExtractionError,
  notifyAuthorsExtractionSuccess,
  notifyAuthorsExtractionWarning,
} from '../../editor/notifications';

type Thunk<T> = ThunkAction<Promise<T>, RootState, HttpClientWrapper, Action>;

type AuthorsSourceType = 'text' | 'url' | 'xml';

function getSourceType(source: string): AuthorsSourceType {
  if (source.startsWith('http') && source.length < 2048) {
    return 'url';
  }
  const doc = new DOMParser().parseFromString(source, 'application/xml');
  const isValidXml = !doc.querySelector('parsererror');
  return isValidXml &&
    doc.documentElement.nodeName === 'collaborationauthorlist'
    ? 'xml'
    : 'text';
}

export function extractAuthors(source: string): Thunk<Author[] | undefined> {
  return async (_dispatch, _getState, http) => {
    try {
      const sourceType = getSourceType(source);
      const response = await http.post(`/editor/authorlist/${sourceType}`, {
        [sourceType]: source,
      });
      const { authors, warnings }: AuthorsExtractionResult = response.data;
      warnings?.forEach((warning) => notifyAuthorsExtractionWarning(warning));
      notifyAuthorsExtractionSuccess(authors.length);
      return authors;
    } catch (error: any) {
      const message =
        error?.response?.status === 400
          ? error.response.data?.message
          : undefined;
      notifyAuthorsExtractionError(message);
      return undefined;
    }
  };
}

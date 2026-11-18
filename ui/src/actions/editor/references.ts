import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { RootState } from '../../types';
import { HttpClientWrapper } from '../../common/http';
import { Reference } from '../../editor/types';
import {
  notifyReferencesExtractionError,
  notifyReferencesExtractionSuccess,
  notifyReferencesLinkingError,
  notifyReferencesLinkingSuccess,
} from '../../editor/notifications';

type Thunk<T> = ThunkAction<Promise<T>, RootState, HttpClientWrapper, Action>;

function isUrlSource(source: string): boolean {
  return source.startsWith('http') && source.length < 2048;
}

export function extractReferences(
  source: string
): Thunk<Reference[] | undefined> {
  return async (_dispatch, _getState, http) => {
    try {
      const sourceType = isUrlSource(source) ? 'url' : 'text';
      const response = await http.post(`/editor/refextract/${sourceType}`, {
        [sourceType]: source,
      });
      notifyReferencesExtractionSuccess(response.data.length);
      return response.data;
    } catch {
      notifyReferencesExtractionError();
      return undefined;
    }
  };
}

export function linkReferences(
  references: Reference[]
): Thunk<Reference[] | undefined> {
  return async (_dispatch, _getState, http) => {
    try {
      const response = await http.post('/matcher/linked_references', {
        references,
      });
      notifyReferencesLinkingSuccess();
      return response.data.references;
    } catch {
      notifyReferencesLinkingError();
      return undefined;
    }
  };
}

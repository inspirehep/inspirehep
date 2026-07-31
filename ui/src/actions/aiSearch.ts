import { Action, ActionCreator } from 'redux';
import { stringify } from 'qs';
import { RootState } from '../types';

import {
  AI_SEARCH_REQUEST,
  AI_SEARCH_SUCCESS,
  AI_SEARCH_ERROR,
  SEARCH_REQUEST,
  SEARCH_SUCCESS,
} from './actionTypes';
import {
  UI_SERIALIZER_REQUEST_OPTIONS,
  isCancelError,
  HttpClientWrapper,
} from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { getConfigFor } from '../common/config';
import { fetchSearchAggregations } from './search';

const AI_SEARCH_QUERY_PREFIX_REGEXP = /^ai:\s*/i;

export const AI_SEARCH_LOGIN_REQUIRED_MESSAGE =
  'Please log in to use the AI assistant.';

const EMPTY_SEARCH_RESULTS = {
  hits: { hits: [], total: 0 },
  sort_options: null,
};

export function isAiSearchQuery(query: string | undefined | null): boolean {
  if (!getConfigFor('AI_SEARCH_FEATURE_FLAG')) {
    return false;
  }
  return (
    typeof query === 'string' &&
    AI_SEARCH_QUERY_PREFIX_REGEXP.test(query.trim())
  );
}

export function stripAiSearchPrefix(query: string): string {
  return query.trim().replace(AI_SEARCH_QUERY_PREFIX_REGEXP, '').trim();
}

export function fetchAiSearchResults(
  namespace: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootState,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    const query = getState().search.getIn(['namespaces', namespace, 'query']);
    const rawQuery = query.get('q');
    if (!isAiSearchQuery(rawQuery)) {
      return;
    }
    const aiQuery = stripAiSearchPrefix(rawQuery);

    const previous = getState().search.getIn([
      'namespaces',
      namespace,
      'aiSearch',
    ]);

    if (
      previous != null &&
      previous.get('loading') &&
      previous.get('query') === aiQuery
    ) {
      return;
    }

    const isStillCurrentQuery = () => {
      const currentRawQuery = getState().search.getIn([
        'namespaces',
        namespace,
        'query',
        'q',
      ]);
      return (
        isAiSearchQuery(currentRawQuery) &&
        stripAiSearchPrefix(currentRawQuery) === aiQuery
      );
    };

    if (!getState().user.get('loggedIn')) {
      dispatch({
        type: AI_SEARCH_ERROR,
        payload: {
          namespace,
          query: aiQuery,
          error: { message: AI_SEARCH_LOGIN_REQUIRED_MESSAGE },
        },
      });
      dispatch({
        type: SEARCH_SUCCESS,
        payload: { namespace, data: EMPTY_SEARCH_RESULTS },
      });
      return;
    }

    const hasAnswerForSameQuery =
      previous != null &&
      previous.get('query') === aiQuery &&
      previous.get('recordIds') != null &&
      previous.get('error') == null;

    try {
      let recordIds;
      let recordsApiUrl;
      if (hasAnswerForSameQuery) {
        dispatch({ type: SEARCH_REQUEST, payload: { namespace } });
        recordIds = previous.get('recordIds').toJS();
        recordsApiUrl = previous.get('recordsApiUrl') || '';
      } else {
        dispatch({
          type: SEARCH_SUCCESS,
          payload: { namespace, data: EMPTY_SEARCH_RESULTS },
        });
        dispatch({
          type: AI_SEARCH_REQUEST,
          payload: { namespace, query: aiQuery },
        });
        const { data } = await http.post('/search/assistant', {
          query: aiQuery,
        });
        if (!isStillCurrentQuery()) {
          return;
        }
        recordIds = data.record_ids || [];
        recordsApiUrl = data.records_api_url || '';
        dispatch({
          type: AI_SEARCH_SUCCESS,
          payload: {
            namespace,
            query: aiQuery,
            response: data.response,
            recordIds,
            recordsApiUrl,
          },
        });
      }

      if (recordIds.length === 0) {
        dispatch({
          type: SEARCH_SUCCESS,
          payload: { namespace, data: EMPTY_SEARCH_RESULTS },
        });
        return;
      }

      const recordsQueryString = stringify(
        {
          ...query.toJS(),
          q: recordIds
            .map((recordId: number) => `recid ${recordId}`)
            .join(' or '),
          size: recordIds.length,
          page: '1',
        },
        { indices: false }
      );
      dispatch(
        fetchSearchAggregations(
          namespace,
          `${recordsApiUrl}/literature/facets?${recordsQueryString}`
        )
      );
      const response = await http.get(
        `${recordsApiUrl}/literature?${recordsQueryString}`,
        UI_SERIALIZER_REQUEST_OPTIONS,
        `search-results-${namespace}`
      );
      if (!isStillCurrentQuery()) {
        return;
      }
      dispatch({
        type: SEARCH_SUCCESS,
        payload: { namespace, data: response.data },
      });
    } catch (err) {
      if (isCancelError(err as Error) || !isStillCurrentQuery()) {
        return;
      }
      const { error } = httpErrorToActionPayload(err);
      dispatch({ type: AI_SEARCH_ERROR, payload: { namespace, error } });
      dispatch({
        type: SEARCH_SUCCESS,
        payload: { namespace, data: EMPTY_SEARCH_RESULTS },
      });
    }
  };
}

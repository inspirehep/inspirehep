import { Action, ActionCreator } from 'redux';
import { stringify } from 'qs';
import { RootState } from '../types';

import {
  AI_SEARCH_REQUEST,
  AI_SEARCH_PROGRESS,
  AI_SEARCH_CHUNK,
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
import { postForServerSentEvents, ServerSentEvent } from '../common/sse';
import { httpErrorToActionPayload } from '../common/utils';
import { getConfigFor } from '../common/config';
import { fetchSearchAggregations } from './search';

const AI_SEARCH_QUERY_PREFIX_REGEXP = /^ai:\s*/i;
const AI_SEARCH_STREAM_URL = '/api/search/assistant/stream';

const activeStreamsByNamespace = new Map<string, AbortController>();

export const AI_SEARCH_LOGIN_REQUIRED_MESSAGE =
  'Please log in to use the AI assistant.';

export const AI_SEARCH_INCOMPLETE_MESSAGE =
  'The connection to the AI assistant was lost before it finished answering. Please try again.';

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

        activeStreamsByNamespace.get(namespace)?.abort();
        const controller = new AbortController();
        activeStreamsByNamespace.set(namespace, controller);

        let answer = '';
        let streamError = null;
        let answerComplete = false;
        try {
          await postForServerSentEvents(
            AI_SEARCH_STREAM_URL,
            { query: aiQuery },
            (event: ServerSentEvent) => {
              if (!isStillCurrentQuery()) {
                controller.abort();
                return;
              }
              switch (event.type) {
                case 'status':
                case 'tool':
                case 'tool_result':
                  dispatch({
                    type: AI_SEARCH_PROGRESS,
                    payload: { namespace, event },
                  });
                  break;
                case 'answer':
                  answer += event.text;
                  dispatch({
                    type: AI_SEARCH_CHUNK,
                    payload: { namespace, text: event.text },
                  });
                  break;
                case 'answer_reset':
                  answer = '';
                  dispatch({
                    type: AI_SEARCH_CHUNK,
                    payload: { namespace, text: '', reset: true },
                  });
                  break;
                case 'done':
                  answer = event.response ?? answer;
                  recordIds = event.record_ids || [];
                  recordsApiUrl = event.records_api_url || '';
                  answerComplete = true;
                  break;
                case 'error':
                  streamError = { response: { status: 502, data: event } };
                  break;
                default:
                  break;
              }
            },
            controller.signal
          );
        } finally {
          if (activeStreamsByNamespace.get(namespace) === controller) {
            activeStreamsByNamespace.delete(namespace);
          }
        }

        if (!streamError && !answerComplete) {
          streamError = {
            response: {
              status: 502,
              data: { message: AI_SEARCH_INCOMPLETE_MESSAGE },
            },
          };
        }
        if (streamError) {
          throw streamError;
        }
        if (!isStillCurrentQuery()) {
          return;
        }
        dispatch({
          type: AI_SEARCH_SUCCESS,
          payload: {
            namespace,
            query: aiQuery,
            response: answer,
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
      if (
        isCancelError(err as Error) ||
        (err as Error)?.name === 'AbortError' ||
        !isStillCurrentQuery()
      ) {
        return;
      }
      const failure =
        (err as any)?.response || (err as any)?.message === 'Network Error'
          ? err
          : { message: 'Network Error' };
      const { error } = httpErrorToActionPayload(failure);
      dispatch({ type: AI_SEARCH_ERROR, payload: { namespace, error } });
      dispatch({
        type: SEARCH_SUCCESS,
        payload: { namespace, data: EMPTY_SEARCH_RESULTS },
      });
    }
  };
}

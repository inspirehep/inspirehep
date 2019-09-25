import { fromJS } from 'immutable';

import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  CLEAR_STATE,
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_SUCCESS,
  AUTHOR_PUBLICATIONS_ERROR,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
  AUTHOR_PUBLICATIONS_FACETS_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
  publications: {
    loadingResults: false,
    total: 0,
    sortOptions: null,
    query: {
      page: 1,
      size: 10,
      sort: 'mostrecent',
    },
    results: [],
    error: null,
    aggregations: {},
    initialAggregations: {},
    loadingAggregations: false,
  },
});

const authorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case AUTHOR_REQUEST:
      return state.set('loading', true);
    case AUTHOR_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'))
        .setIn(
          ['publications', 'query', 'author'],
          fromJS([action.payload.metadata.facet_author_name])
        );
    case AUTHOR_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload))
        .set('data', initialState.get('data'));
    case AUTHOR_PUBLICATIONS_REQUEST:
      return state
        .setIn(['publications', 'loadingResults'], true)
        .setIn(['publications', 'query'], fromJS(action.payload));
    case AUTHOR_PUBLICATIONS_SUCCESS:
      return state
        .setIn(['publications', 'loadingResults'], false)
        .setIn(['publications', 'total'], fromJS(action.payload.hits.total))
        .setIn(
          ['publications', 'sortOptions'],
          fromJS(action.payload.sort_options)
        )
        .setIn(['publications', 'results'], fromJS(action.payload.hits.hits))
        .setIn(
          ['publications', 'error'],
          initialState.getIn(['publications', 'error'])
        );
    case AUTHOR_PUBLICATIONS_ERROR:
      return state
        .setIn(['publications', 'loadingResults'], false)
        .setIn(['publications', 'error'], fromJS(action.payload))
        .setIn(
          ['publications', 'total'],
          initialState.getIn(['publications', 'total'])
        )
        .setIn(
          ['publications', 'sortOptions'],
          initialState.getIn(['publications', 'sortOptions'])
        )
        .setIn(
          ['publications', 'results'],
          initialState.getIn(['publications', 'results'])
        );
    case AUTHOR_PUBLICATIONS_FACETS_REQUEST:
      return state
        .setIn(['publications', 'loadingAggregations'], true)
        .setIn(['publications', 'query'], fromJS(action.payload));
    case AUTHOR_PUBLICATIONS_FACETS_SUCCESS:
      if (state.getIn(['publications', 'initialAggregations']).isEmpty()) {
        // eslint-disable-next-line no-param-reassign
        state = state.setIn(
          ['publications', 'initialAggregations'],
          fromJS(action.payload.aggregations)
        );
      }
      return state
        .setIn(['publications', 'loadingAggregations'], false)
        .setIn(
          ['publications', 'aggregations'],
          fromJS(action.payload.aggregations)
        )
        .setIn(
          ['publications', 'error'],
          initialState.getIn(['publications', 'error'])
        );
    case AUTHOR_PUBLICATIONS_FACETS_ERROR:
      return state
        .setIn(['publications', 'loadingAggregations'], false)
        .setIn(['publications', 'error'], fromJS(action.payload))
        .setIn(
          ['publications', 'aggregations'],
          initialState.getIn(['publications', 'aggregations'])
        );
    default:
      return state;
  }
};

export default authorsReducer;

import { fromJS } from 'immutable';

import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
  LITERATURE_REFERENCES_ERROR,
  LITERATURE_REFERENCES_REQUEST,
  LITERATURE_REFERENCES_SUCCESS,
  LITERATURE_AUTHORS_ERROR,
  LITERATURE_AUTHORS_REQUEST,
  LITERATURE_AUTHORS_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: {},
  loadingReferences: false,
  errorReferences: {},
  references: [],
  loadingAuthors: false,
  errorAuthors: {},
  authors: [],
});

const literatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case LITERATURE_REQUEST:
      return state.set('loading', true);
    case LITERATURE_SUCCESS:
      return state.set('loading', false).set('data', fromJS(action.payload));
    case LITERATURE_ERROR:
      return state
        .set('loading', false)
        .set('data', fromJS({}))
        .set('error', fromJS(action.payload));
    case LITERATURE_REFERENCES_REQUEST:
      return state.set('loadingReferences', true);
    case LITERATURE_REFERENCES_SUCCESS:
      return state
        .set('loadingReferences', false)
        .set('references', fromJS(action.payload.metadata.references))
        .set('errorReferences', initialState.get('errorReferences'));
    case LITERATURE_REFERENCES_ERROR:
      return state
        .set('loadingReferences', false)
        .set('errorReferences', fromJS(action.payload))
        .set('references', initialState.get('references'));
    case LITERATURE_AUTHORS_REQUEST:
      return state.set('loadingAuthors', true);
    case LITERATURE_AUTHORS_SUCCESS:
      return state
        .set('loadingAuthors', false)
        .set('authors', fromJS(action.payload.metadata.authors))
        .set('errorAuthors', initialState.get('errorAuthors'));
    case LITERATURE_AUTHORS_ERROR:
      return state
        .set('loadingAuthors', false)
        .set('errorAuthors', fromJS(action.payload))
        .set('authors', initialState.get('authors'));
    default:
      return state;
  }
};

export default literatureReducer;

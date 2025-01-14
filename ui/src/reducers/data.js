import { fromJS } from 'immutable';
import {
  DATA_REQUEST,
  DATA_SUCCESS,
  DATA_ERROR,
  DATA_AUTHORS_REQUEST,
  DATA_AUTHORS_SUCCESS,
  DATA_AUTHORS_ERROR,
  CLEAR_STATE,
} from '../actions/actionTypes';
import {
  onRequest,
  onSuccess,
  onError,
  initialState as initialRecordState,
} from './recordsFactory';

export const initialState = fromJS({
  loadingAuthors: false,
  errorAuthors: null,
  authors: [],
}).merge(initialRecordState);

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case DATA_REQUEST:
      return onRequest(state);
    case DATA_SUCCESS:
      return onSuccess(state, action);
    case DATA_ERROR:
      return onError(state, action);
    case DATA_AUTHORS_REQUEST:
      return state.set('loadingAuthors', true);
    case DATA_AUTHORS_SUCCESS:
      return state
        .set('loadingAuthors', false)
        .set('authors', fromJS(action.payload.metadata.authors))
        .set('supervisors', fromJS(action.payload.metadata.supervisors))
        .set('errorAuthors', initialState.get('errorAuthors'));
    case DATA_AUTHORS_ERROR:
      return state
        .set('loadingAuthors', false)
        .set('errorAuthors', fromJS(action.payload.error))
        .set('authors', initialState.get('authors'));
    default:
      return state;
  }
};

export default dataReducer;
